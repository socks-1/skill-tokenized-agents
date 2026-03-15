/**
 * Data-fetching functions shared between /api/preview (free) and /api/verify (post-payment).
 * All functions are read-only calls to public APIs — no auth required.
 */

export type ServiceType = "crypto-prices" | "solana-stats" | "defi-yields" | "fear-greed" | "solana-ecosystem" | "ai-models" | "trending-coins" | "top-gainers" | "dex-volume" | "pumpfun-tokens" | "pump-new" | "funding-rates";

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

export interface AiModel {
  id: string;
  displayName: string;
  downloads: number;
  likes: number;
}

export interface AiModelsData {
  models: AiModel[];
}

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank?: number;
  price_usd: number;
  change_24h_pct: number;
  market_cap?: string;
}

export interface TrendingData {
  coins: TrendingCoin[];
}

export interface TopGainer {
  symbol: string;
  name: string;
  price_usd: number;
  change_24h_pct: number;
  volume_24h: number;
  market_cap: number;
}

export interface TopGainersData {
  gainers: TopGainer[];
}

export interface DexVolume {
  name: string;
  chains: string[];
  volume_24h: number;
  volume_7d: number;
  change_1d: number;
}

export interface DexVolumeData {
  dexes: DexVolume[];
}

export interface PumpToken {
  symbol: string;
  name: string;
  price_usd: number;
  change_24h_pct: number;
  volume_24h: number;
  market_cap: number;
  address: string;
}

export interface PumpTokenData {
  tokens: PumpToken[];
}

export interface PumpNewToken {
  symbol: string;
  name: string;
  price_usd: number;
  change_24h_pct: number;
  volume_24h: number;
  market_cap: number;
  address: string;
  pair_created_at: number;
}

export interface PumpNewData {
  tokens: PumpNewToken[];
}

export interface FundingRate {
  symbol: string;
  rate_8h: number;   // funding rate per 8h period as a decimal (e.g. 0.0001 = 0.01%)
  mark_price: number;
  open_interest: number;
}

export interface FundingRateData {
  rates: FundingRate[];
}

export interface ServiceResult {
  service_type: ServiceType;
  result: string;
  market_data?: MarketData[];
  solana_stats?: SolanaStats;
  defi_pools?: DefiPool[];
  fear_greed?: FearGreedData;
  solana_ecosystem?: SolanaEcosystemData;
  ai_models?: AiModelsData;
  trending?: TrendingData;
  top_gainers?: TopGainersData;
  dex_volume?: DexVolumeData;
  pumpfun_tokens?: PumpTokenData;
  pump_new?: PumpNewData;
  funding_rates?: FundingRateData;
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

/**
 * Fetches the top AI language models from Hugging Face by community likes.
 * Filters to text-generation models — reflects what the AI community values most.
 * Free public API, no auth required.
 */
export async function deliverAiModels(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  const url =
    "https://huggingface.co/api/models" +
    "?sort=likes&direction=-1&limit=8&pipeline_tag=text-generation";

  let ai_models: AiModelsData | undefined;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = (await res.json()) as Array<{
        id: string;
        downloads: number;
        likes: number;
        pipeline_tag?: string;
      }>;

      const models: AiModel[] = data
        .filter((m) => m.id && m.likes > 0)
        .slice(0, 8)
        .map((m) => {
          // "org/model-name" → "model-name" for display; keep full id for context
          const parts = m.id.split("/");
          const displayName = parts.length > 1 ? `${parts[0]}/${parts[1]}` : m.id;
          return {
            id: m.id,
            displayName,
            downloads: m.downloads ?? 0,
            likes: m.likes ?? 0,
          };
        });

      if (models.length > 0) {
        ai_models = { models };
      }
    }
  } catch {
    // Fall through with undefined ai_models
  }

  const result = ai_models && ai_models.models.length > 0
    ? ai_models.models
        .slice(0, 3)
        .map((m) => {
          const name = m.displayName.split("/").pop() ?? m.displayName;
          return `${name} ★${m.likes.toLocaleString()}`;
        })
        .join(" | ")
    : "AI model data temporarily unavailable";

  return { service_type: "ai-models", result, ai_models, timestamp, delivered_to };
}

/**
 * Fetches the top 7 trending coins from CoinGecko's trending search endpoint.
 * These are the coins with the most searches on CoinGecko in the last 24 hours.
 * Free public API, no auth required.
 */
export async function deliverTrending(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let trending: TrendingData | undefined;

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/search/trending", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        coins: Array<{
          item: {
            id: string;
            name: string;
            symbol: string;
            market_cap_rank?: number;
            data: {
              price: number;
              price_change_percentage_24h?: { usd?: number };
              market_cap?: string;
            };
          };
        }>;
      };

      const coins: TrendingCoin[] = data.coins
        .slice(0, 7)
        .map((c) => ({
          id: c.item.id,
          name: c.item.name,
          symbol: c.item.symbol,
          market_cap_rank: c.item.market_cap_rank,
          price_usd: c.item.data?.price ?? 0,
          change_24h_pct: parseFloat(
            (c.item.data?.price_change_percentage_24h?.usd ?? 0).toFixed(2)
          ),
          market_cap: c.item.data?.market_cap,
        }));

      if (coins.length > 0) {
        trending = { coins };
      }
    }
  } catch {
    // Fall through with undefined trending
  }

  const result =
    trending && trending.coins.length > 0
      ? trending.coins
          .slice(0, 4)
          .map((c) => {
            const price =
              c.price_usd < 0.01
                ? `$${c.price_usd.toFixed(6)}`
                : c.price_usd < 1
                ? `$${c.price_usd.toFixed(4)}`
                : `$${c.price_usd.toLocaleString()}`;
            return `${c.symbol} ${price} (${c.change_24h_pct >= 0 ? "+" : ""}${c.change_24h_pct}%)`;
          })
          .join(" | ")
      : "Trending coin data temporarily unavailable";

  return { service_type: "trending-coins", result, trending, timestamp, delivered_to };
}

/**
 * Fetches the top crypto gainers over the last 24h from CoinGecko.
 * Filters for coins with >5% gain AND >$1M daily volume to surface meaningful movers.
 */
export async function deliverTopGainers(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  const url =
    "https://api.coingecko.com/api/v3/coins/markets" +
    "?vs_currency=usd&order=price_change_percentage_24h_desc&per_page=50&page=1" +
    "&price_change_percentage=24h&sparkline=false";

  let top_gainers: TopGainersData | undefined;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = (await res.json()) as Array<{
        symbol: string;
        name: string;
        current_price: number;
        price_change_percentage_24h: number;
        total_volume: number;
        market_cap: number;
      }>;

      const gainers: TopGainer[] = data
        .filter((c) => c.price_change_percentage_24h > 5 && c.total_volume > 1_000_000)
        .slice(0, 8)
        .map((c) => ({
          symbol: c.symbol.toUpperCase(),
          name: c.name,
          price_usd: c.current_price,
          change_24h_pct: parseFloat(c.price_change_percentage_24h.toFixed(2)),
          volume_24h: c.total_volume,
          market_cap: c.market_cap,
        }));

      if (gainers.length > 0) {
        top_gainers = { gainers };
      }
    }
  } catch {
    // Fall through with undefined top_gainers
  }

  const result =
    top_gainers && top_gainers.gainers.length > 0
      ? top_gainers.gainers
          .slice(0, 4)
          .map((g) => `${g.symbol} +${g.change_24h_pct}%`)
          .join(" | ")
      : "Top gainer data temporarily unavailable";

  return { service_type: "top-gainers", result, top_gainers, timestamp, delivered_to };
}

/**
 * Fetches Solana DEX volume leaders from DeFi Llama.
 * Filters to protocols where chains array contains 'Solana', sorted by 24h volume.
 * Returns the top 8.
 */
export async function deliverDexVolume(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  const url =
    "https://api.llama.fi/overview/dexs?chain=Solana" +
    "&excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true";

  let dex_volume: DexVolumeData | undefined;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        protocols: Array<{
          name: string;
          chains: string[];
          total24h: number;
          total7d: number;
          change_1d: number;
        }>;
      };

      const dexes: DexVolume[] = data.protocols
        .filter((p) => Array.isArray(p.chains) && p.chains.includes("Solana") && p.chains.length <= 3)
        .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
        .slice(0, 8)
        .map((p) => ({
          name: p.name,
          chains: p.chains,
          volume_24h: p.total24h ?? 0,
          volume_7d: p.total7d ?? 0,
          change_1d: parseFloat((p.change_1d ?? 0).toFixed(2)),
        }));

      if (dexes.length > 0) {
        dex_volume = { dexes };
      }
    }
  } catch {
    // Fall through with undefined dex_volume
  }

  const formatVol = (v: number) =>
    v >= 1_000_000_000
      ? `$${(v / 1_000_000_000).toFixed(1)}B`
      : v >= 1_000_000
      ? `$${(v / 1_000_000).toFixed(0)}M`
      : `$${(v / 1_000).toFixed(0)}K`;

  const result =
    dex_volume && dex_volume.dexes.length > 0
      ? dex_volume.dexes
          .slice(0, 3)
          .map((d) => `${d.name} ${formatVol(d.volume_24h)}`)
          .join(" | ")
      : "DEX volume data temporarily unavailable";

  return { service_type: "dex-volume", result, dex_volume, timestamp, delivered_to };
}

/**
 * Fetches top pump.fun tokens by 24h volume from DexScreener.
 * Queries PumpSwap pairs on Solana, filters to the most active tokens.
 */
export async function deliverPumpTokens(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  const url = "https://api.dexscreener.com/latest/dex/search?q=pumpswap";

  let pumpfun_tokens: PumpTokenData | undefined;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        pairs: Array<{
          chainId: string;
          dexId: string;
          baseToken: { address: string; name: string; symbol: string };
          priceUsd?: string;
          volume?: { h24?: number };
          priceChange?: { h24?: number };
          marketCap?: number;
          fdv?: number;
        }>;
      };

      const tokens: PumpToken[] = (data.pairs ?? [])
        .filter((p) => p.chainId === "solana" && p.dexId === "pumpswap" && (p.volume?.h24 ?? 0) > 0)
        .sort((a, b) => (b.volume?.h24 ?? 0) - (a.volume?.h24 ?? 0))
        .slice(0, 6)
        .map((p) => ({
          symbol: p.baseToken.symbol,
          name: p.baseToken.name,
          price_usd: parseFloat(p.priceUsd ?? "0"),
          change_24h_pct: parseFloat((p.priceChange?.h24 ?? 0).toFixed(2)),
          volume_24h: p.volume?.h24 ?? 0,
          market_cap: p.marketCap ?? p.fdv ?? 0,
          address: p.baseToken.address,
        }));

      if (tokens.length > 0) {
        pumpfun_tokens = { tokens };
      }
    }
  } catch {
    // Fall through with undefined pumpfun_tokens
  }

  const formatVol = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;

  const result =
    pumpfun_tokens && pumpfun_tokens.tokens.length > 0
      ? pumpfun_tokens.tokens
          .slice(0, 3)
          .map((t) => `${t.symbol} ${formatVol(t.volume_24h)} vol`)
          .join(" | ")
      : "Pump.fun token data temporarily unavailable";

  return { service_type: "pumpfun-tokens", result, pumpfun_tokens, timestamp, delivered_to };
}

/**
 * Fetches the most recently launched tokens on pump.fun via DexScreener.
 * Queries PumpSwap pairs on Solana and sorts by pair creation time (newest first).
 * Complements "Hot Tokens" (top by volume) with a "fresh launches" view.
 */
export async function deliverPumpNew(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  const url = "https://api.dexscreener.com/latest/dex/search?q=pumpswap";

  let pump_new: PumpNewData | undefined;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        pairs: Array<{
          chainId: string;
          dexId: string;
          baseToken: { address: string; name: string; symbol: string };
          priceUsd?: string;
          volume?: { h24?: number };
          priceChange?: { h24?: number };
          marketCap?: number;
          fdv?: number;
          pairCreatedAt?: number;
        }>;
      };

      const tokens: PumpNewToken[] = (data.pairs ?? [])
        .filter((p) => p.chainId === "solana" && p.dexId === "pumpswap" && p.pairCreatedAt)
        .sort((a, b) => (b.pairCreatedAt ?? 0) - (a.pairCreatedAt ?? 0))
        .slice(0, 6)
        .map((p) => ({
          symbol: p.baseToken.symbol,
          name: p.baseToken.name,
          price_usd: parseFloat(p.priceUsd ?? "0"),
          change_24h_pct: parseFloat((p.priceChange?.h24 ?? 0).toFixed(2)),
          volume_24h: p.volume?.h24 ?? 0,
          market_cap: p.marketCap ?? p.fdv ?? 0,
          address: p.baseToken.address,
          pair_created_at: p.pairCreatedAt ?? 0,
        }));

      if (tokens.length > 0) {
        pump_new = { tokens };
      }
    }
  } catch {
    // Fall through with undefined pump_new
  }

  const formatAge = (createdAt: number) => {
    const ageMs = Date.now() - createdAt;
    const hours = Math.floor(ageMs / 3_600_000);
    const minutes = Math.floor((ageMs % 3_600_000) / 60_000);
    if (hours >= 24) return `${Math.floor(hours / 24)}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const result =
    pump_new && pump_new.tokens.length > 0
      ? pump_new.tokens
          .slice(0, 3)
          .map((t) => `${t.symbol} (${formatAge(t.pair_created_at)})`)
          .join(" | ")
      : "New launch data temporarily unavailable";

  return { service_type: "pump-new", result, pump_new, timestamp, delivered_to };
}

/**
 * Fetches perpetual futures funding rates from Hyperliquid's public API.
 * Shows the current 8h funding rate for major perps — positive means longs pay
 * shorts (bullish positioning), negative means shorts pay longs (bearish).
 */
export async function deliverFundingRates(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  const url = "https://api.hyperliquid.xyz/info";

  // Coins to display — show a relevant cross-section of the market
  const FEATURED = ["BTC", "ETH", "SOL", "BNB", "DOGE", "AVAX", "LINK", "SUI"];

  let funding_rates: FundingRateData | undefined;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ type: "metaAndAssetCtxs" }),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = (await res.json()) as [
        { universe: Array<{ name: string; szDecimals: number; maxLeverage: number }> },
        Array<{ funding: string; openInterest: string; markPx: string }>
      ];

      const [meta, ctxs] = data;
      const rates: FundingRate[] = [];

      meta.universe.forEach((asset, i) => {
        if (!FEATURED.includes(asset.name)) return;
        const ctx = ctxs[i];
        if (!ctx) return;
        const markPx = parseFloat(ctx.markPx);
        rates.push({
          symbol: asset.name,
          rate_8h: parseFloat(ctx.funding),
          mark_price: markPx,
          open_interest: parseFloat(ctx.openInterest) * markPx, // convert to USD notional
        });
      });

      // Sort by featured order
      rates.sort((a, b) => FEATURED.indexOf(a.symbol) - FEATURED.indexOf(b.symbol));

      if (rates.length > 0) {
        funding_rates = { rates };
      }
    }
  } catch {
    // Fall through with undefined funding_rates
  }

  const formatRate = (r: number) => {
    const pct = (r * 100).toFixed(4);
    return r >= 0 ? `+${pct}%` : `${pct}%`;
  };

  const result =
    funding_rates && funding_rates.rates.length > 0
      ? funding_rates.rates
          .slice(0, 4)
          .map((r) => `${r.symbol} ${formatRate(r.rate_8h)}/8h`)
          .join(" | ")
      : "Funding rate data temporarily unavailable";

  return { service_type: "funding-rates", result, funding_rates, timestamp, delivered_to };
}

export async function deliverService(delivered_to: string, serviceType: ServiceType): Promise<ServiceResult> {
  const timestamp = new Date().toISOString();
  if (serviceType === "solana-stats") return deliverSolanaStats(delivered_to, timestamp);
  if (serviceType === "defi-yields") return deliverDefiYields(delivered_to, timestamp);
  if (serviceType === "fear-greed") return deliverFearGreed(delivered_to, timestamp);
  if (serviceType === "solana-ecosystem") return deliverSolanaEcosystem(delivered_to, timestamp);
  if (serviceType === "ai-models") return deliverAiModels(delivered_to, timestamp);
  if (serviceType === "trending-coins") return deliverTrending(delivered_to, timestamp);
  if (serviceType === "top-gainers") return deliverTopGainers(delivered_to, timestamp);
  if (serviceType === "dex-volume") return deliverDexVolume(delivered_to, timestamp);
  if (serviceType === "pumpfun-tokens") return deliverPumpTokens(delivered_to, timestamp);
  if (serviceType === "pump-new") return deliverPumpNew(delivered_to, timestamp);
  if (serviceType === "funding-rates") return deliverFundingRates(delivered_to, timestamp);
  return deliverCryptoPrices(delivered_to, timestamp);
}
