/**
 * Data-fetching functions shared between /api/preview (free) and /api/verify (post-payment).
 * All functions are read-only calls to public APIs — no auth required.
 */

export type ServiceType = "crypto-prices" | "solana-stats" | "defi-yields" | "fear-greed" | "solana-ecosystem";

export interface MarketData {
  symbol: string;
  price_usd: number;
  change_24h_pct: number;
}

export interface SolanaStats {
  tps: number;
  slot: number;
  validator_count: number;
  epoch: number;
}

export interface DefiPool {
  protocol: string;
  symbol: string;
  apy: number;
  tvl_usd: number;
}

export interface FearGreedEntry {
  date: string;
  value: number;
  classification: string;
}

export interface FearGreedData {
  current_value: number;
  classification: string;
  history: FearGreedEntry[];
}

export interface SolanaToken {
  symbol: string;
  name: string;
  price_usd: number;
  change_24h_pct: number;
  market_cap_usd: number;
}

export interface SolanaEcosystemData {
  tokens: SolanaToken[];
}

export interface ServiceResult {
  service_type: ServiceType;
  result: string;
  market_data?: MarketData[];
  solana_stats?: SolanaStats;
  defi_pools?: DefiPool[];
  fear_greed?: FearGreedData;
  solana_ecosystem?: SolanaEcosystemData;
  timestamp: string;
  delivered_to: string;
}

/**
 * Fetches live crypto prices for BTC, ETH, and SOL from CoinGecko.
 */
export async function deliverCryptoPrices(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  const url =
    "https://api.coingecko.com/api/v3/simple/price" +
    "?ids=solana,bitcoin,ethereum" +
    "&vs_currencies=usd" +
    "&include_24hr_change=true";

  let market_data: MarketData[] = [];

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = (await res.json()) as Record<
        string,
        { usd: number; usd_24h_change: number }
      >;

      const mapping: Record<string, string> = {
        bitcoin: "BTC",
        ethereum: "ETH",
        solana: "SOL",
      };

      market_data = Object.entries(mapping)
        .filter(([id]) => data[id])
        .map(([id, symbol]) => ({
          symbol,
          price_usd: data[id].usd,
          change_24h_pct: parseFloat(data[id].usd_24h_change.toFixed(2)),
        }));
    }
  } catch {
    // Fall through with empty market_data
  }

  const result =
    market_data.length > 0
      ? market_data
          .map(
            (m) =>
              `${m.symbol} $${m.price_usd.toLocaleString()} (${m.change_24h_pct >= 0 ? "+" : ""}${m.change_24h_pct}% 24h)`
          )
          .join(" | ")
      : "Market data temporarily unavailable";

  return { service_type: "crypto-prices", result, market_data, timestamp, delivered_to };
}

/**
 * Fetches live Solana network stats via the public RPC.
 */
export async function deliverSolanaStats(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://rpc.solanatracker.io/public";
  let solana_stats: SolanaStats | undefined;

  try {
    const [slotRes, epochRes, perfRes] = await Promise.all([
      fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot" }),
        signal: AbortSignal.timeout(8000),
      }),
      fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "getEpochInfo" }),
        signal: AbortSignal.timeout(8000),
      }),
      fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 3,
          method: "getRecentPerformanceSamples",
          params: [5],
        }),
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    const [slotData, epochData, perfData] = await Promise.all([
      slotRes.json() as Promise<{ result: number }>,
      epochRes.json() as Promise<{ result: { epoch: number; slotIndex: number } }>,
      perfRes.json() as Promise<{ result: Array<{ numTransactions: number; samplePeriodSecs: number }> }>,
    ]);

    const slot: number = slotData.result;
    const epoch: number = epochData.result.epoch;

    let tps = 0;
    if (perfData.result && perfData.result.length > 0) {
      const samples = perfData.result;
      const totalTx = samples.reduce((sum, s) => sum + s.numTransactions, 0);
      const totalSecs = samples.reduce((sum, s) => sum + s.samplePeriodSecs, 0);
      tps = totalSecs > 0 ? Math.round(totalTx / totalSecs) : 0;
    }

    let validator_count = 0;
    try {
      const voteRes = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 4,
          method: "getVoteAccounts",
          params: [{ commitment: "confirmed" }],
        }),
        signal: AbortSignal.timeout(6000),
      });
      const voteData = (await voteRes.json()) as { result: { current: unknown[] } };
      validator_count = voteData.result?.current?.length ?? 0;
    } catch {
      // validator count is best-effort
    }

    solana_stats = { tps, slot, validator_count, epoch };
  } catch {
    // Fall through with undefined solana_stats
  }

  const result = solana_stats
    ? `TPS: ${solana_stats.tps.toLocaleString()} | Slot: ${solana_stats.slot.toLocaleString()} | Epoch: ${solana_stats.epoch} | Validators: ${solana_stats.validator_count.toLocaleString()}`
    : "Solana network stats temporarily unavailable";

  return { service_type: "solana-stats", result, solana_stats, timestamp, delivered_to };
}

/**
 * Fetches top Solana DeFi pool yields from DeFi Llama (free, no auth required).
 * Returns the 8 highest-TVL Solana pools with APY and TVL.
 */
export async function deliverDefiYields(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let defi_pools: DefiPool[] = [];

  try {
    const res = await fetch("https://yields.llama.fi/pools", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        data: Array<{
          chain: string;
          project: string;
          symbol: string;
          apy: number;
          tvlUsd: number;
        }>;
      };

      const solanaPools = data.data
        .filter((p) => p.chain === "Solana" && p.tvlUsd > 1_000_000)
        .sort((a, b) => b.tvlUsd - a.tvlUsd)
        .slice(0, 8);

      defi_pools = solanaPools.map((p) => ({
        protocol: p.project,
        symbol: p.symbol,
        apy: parseFloat(p.apy.toFixed(2)),
        tvl_usd: p.tvlUsd,
      }));
    }
  } catch {
    // Fall through with empty defi_pools
  }

  const result =
    defi_pools.length > 0
      ? defi_pools
          .slice(0, 4)
          .map((p) => `${p.protocol} ${p.symbol} ${p.apy.toFixed(2)}% APY`)
          .join(" | ")
      : "DeFi yield data temporarily unavailable";

  return { service_type: "defi-yields", result, defi_pools, timestamp, delivered_to };
}

/**
 * Fetches the Crypto Fear & Greed Index with 7-day history from Alternative.me.
 * Scale: 0–24 Extreme Fear, 25–44 Fear, 45–55 Neutral, 56–74 Greed, 75–100 Extreme Greed.
 */
export async function deliverFearGreed(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let fear_greed: FearGreedData | undefined;

  try {
    const res = await fetch("https://api.alternative.me/fng/?limit=7", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const json = (await res.json()) as {
        data: Array<{ value: string; value_classification: string; timestamp: string }>;
      };

      if (json.data && json.data.length > 0) {
        const current = json.data[0];
        const history: FearGreedEntry[] = json.data.map((d) => ({
          date: new Date(parseInt(d.timestamp, 10) * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          value: parseInt(d.value, 10),
          classification: d.value_classification,
        }));

        fear_greed = {
          current_value: parseInt(current.value, 10),
          classification: current.value_classification,
          history,
        };
      }
    }
  } catch {
    // Fall through with undefined fear_greed
  }

  const result = fear_greed
    ? `Fear & Greed: ${fear_greed.current_value}/100 (${fear_greed.classification})`
    : "Sentiment data temporarily unavailable";

  return { service_type: "fear-greed", result, fear_greed, timestamp, delivered_to };
}

/**
 * Fetches live prices for top Solana ecosystem tokens (JUP, RAY, JTO, BONK, WIF, PYTH, ORCA)
 * from CoinGecko's free tier — includes market cap for ranking context.
 */
export async function deliverSolanaEcosystem(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  const TOKEN_MAP: Array<{ id: string; symbol: string; name: string }> = [
    { id: "jupiter-exchange-solana", symbol: "JUP", name: "Jupiter" },
    { id: "raydium", symbol: "RAY", name: "Raydium" },
    { id: "jito-governance-token", symbol: "JTO", name: "Jito" },
    { id: "bonk", symbol: "BONK", name: "Bonk" },
    { id: "dogwifcoin", symbol: "WIF", name: "dogwifhat" },
    { id: "pyth-network", symbol: "PYTH", name: "Pyth" },
    { id: "orca", symbol: "ORCA", name: "Orca" },
  ];

  const ids = TOKEN_MAP.map((t) => t.id).join(",");
  const url =
    `https://api.coingecko.com/api/v3/simple/price` +
    `?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`;

  let solana_ecosystem: SolanaEcosystemData | undefined;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = (await res.json()) as Record<
        string,
        { usd: number; usd_24h_change: number; usd_market_cap: number }
      >;

      const tokens: SolanaToken[] = TOKEN_MAP
        .filter((t) => data[t.id])
        .map((t) => ({
          symbol: t.symbol,
          name: t.name,
          price_usd: data[t.id].usd,
          change_24h_pct: parseFloat(data[t.id].usd_24h_change.toFixed(2)),
          market_cap_usd: data[t.id].usd_market_cap,
        }));

      if (tokens.length > 0) {
        solana_ecosystem = { tokens };
      }
    }
  } catch {
    // Fall through with undefined solana_ecosystem
  }

  const result = solana_ecosystem && solana_ecosystem.tokens.length > 0
    ? solana_ecosystem.tokens
        .slice(0, 4)
        .map((t) => `${t.symbol} $${t.price_usd < 1 ? t.price_usd.toFixed(4) : t.price_usd.toLocaleString()} (${t.change_24h_pct >= 0 ? "+" : ""}${t.change_24h_pct}%)`)
        .join(" | ")
    : "Solana ecosystem token data temporarily unavailable";

  return { service_type: "solana-ecosystem", result, solana_ecosystem, timestamp, delivered_to };
}

export async function deliverService(delivered_to: string, serviceType: ServiceType): Promise<ServiceResult> {
  const timestamp = new Date().toISOString();
  if (serviceType === "solana-stats") return deliverSolanaStats(delivered_to, timestamp);
  if (serviceType === "defi-yields") return deliverDefiYields(delivered_to, timestamp);
  if (serviceType === "fear-greed") return deliverFearGreed(delivered_to, timestamp);
  if (serviceType === "solana-ecosystem") return deliverSolanaEcosystem(delivered_to, timestamp);
  return deliverCryptoPrices(delivered_to, timestamp);
}
