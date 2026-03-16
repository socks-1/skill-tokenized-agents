/**
 * Data-fetching functions shared between /api/preview (free) and /api/verify (post-payment).
 * All functions are read-only calls to public APIs — no auth required.
 */

export type ServiceType = "crypto-prices" | "solana-stats" | "defi-yields" | "fear-greed" | "solana-ecosystem" | "ai-models" | "trending-coins" | "top-gainers" | "dex-volume" | "pumpfun-tokens" | "pump-new" | "funding-rates" | "btc-mempool" | "stablecoins" | "sol-protocol-tvl" | "ai-agent-tokens" | "sol-revenue" | "eth-gas" | "global-market" | "l2-tvl" | "sol-lst" | "polymarket" | "narratives" | "defi-fees";

/** All valid service type strings — use this for runtime validation instead of duplicating the list. */
export const ALL_SERVICE_TYPES: ServiceType[] = ["crypto-prices", "solana-stats", "defi-yields", "fear-greed", "solana-ecosystem", "ai-models", "trending-coins", "top-gainers", "dex-volume", "pumpfun-tokens", "pump-new", "funding-rates", "btc-mempool", "stablecoins", "sol-protocol-tvl", "ai-agent-tokens", "sol-revenue", "eth-gas", "global-market", "l2-tvl", "sol-lst", "polymarket", "narratives", "defi-fees"];

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

export interface BtcMempoolData {
  count: number;         // pending transaction count
  vsize_mb: number;      // mempool virtual size in MB
  fee_fastest: number;   // sat/vB for next block confirmation
  fee_30min: number;     // sat/vB for ~30 min confirmation
  fee_60min: number;     // sat/vB for ~1 hour confirmation
}

export interface StablecoinEntry {
  symbol: string;
  name: string;
  supply_usd: number;       // current circulating supply in USD
  change_24h_pct: number;   // 24h supply change %
  peg_mechanism: string;    // fiat-backed | crypto-backed | algorithmic | etc.
}

export interface StablecoinData {
  coins: StablecoinEntry[];
  total_supply_usd: number; // sum of all shown stablecoins
}

export interface SolTvlProtocol {
  name: string;
  category: string;         // Lending | Liquid Staking | Dexs | Derivatives | etc.
  tvl_usd: number;
  change_1d_pct: number;    // 24h TVL change %
}

export interface SolTvlData {
  protocols: SolTvlProtocol[];
  total_tvl_usd: number;    // sum of shown protocols
}

export interface AiAgentToken {
  symbol: string;
  name: string;
  price_usd: number;
  change_24h_pct: number;
  market_cap_usd: number;
  market_cap_rank: number;
}

export interface AiAgentTokensData {
  tokens: AiAgentToken[];
}

export interface SolRevenueProtocol {
  name: string;
  category: string;
  revenue_24h: number;   // USD
  revenue_7d: number;    // USD
}

export interface SolRevenueData {
  protocols: SolRevenueProtocol[];
  total_revenue_24h: number;
}

export interface EthGasLevel {
  label: string;       // "Slow" | "Standard" | "Fast" | "Rapid"
  gwei: number;        // max fee per gas in Gwei
  wait: string;        // estimated inclusion time
  cost_usd: number;    // estimated cost for simple ETH transfer (21,000 gas) in USD
}

export interface EthGasData {
  levels: EthGasLevel[];
  eth_price_usd: number;
  base_fee_gwei: number;
}

export interface GlobalMarketData {
  total_market_cap_usd: number;        // Total crypto market cap in USD
  total_volume_24h_usd: number;        // 24h total trading volume in USD
  market_cap_change_24h_pct: number;   // 24h % change in total market cap
  btc_dominance: number;               // Bitcoin market cap dominance %
  eth_dominance: number;               // Ethereum market cap dominance %
  active_cryptos: number;              // Number of actively tracked cryptocurrencies
  defi_market_cap_usd: number;         // Total DeFi market cap in USD
  stablecoin_volume_24h_usd: number;   // 24h stablecoin trading volume in USD
}

export interface L2Chain {
  name: string;
  tvl_usd: number;
  change_1d_pct: number;
}

export interface L2TvlData {
  chains: L2Chain[];
  total_tvl_usd: number;
}

export interface SolLstToken {
  symbol: string;
  project: string;
  apy: number;
  tvl_usd: number;
}

export interface SolLstData {
  tokens: SolLstToken[];
  avg_apy: number;
}

export interface PolymarketEntry {
  question: string;
  outcomes: string[];
  prices: number[];
  volume_24h: number;
}

export interface PolymarketData {
  markets: PolymarketEntry[];
  total_volume_24h: number;
}

export interface NarrativeEntry {
  name: string;
  market_cap: number;
  change_24h_pct: number;
  volume_24h: number;
  top_coins: string[];
}

export interface NarrativeData {
  narratives: NarrativeEntry[];
}

export interface DefiFeesEntry {
  name: string;
  category: string;
  total30d: number;
  total24h: number;
  change_1m: number | null;
  chains: string[];
}

export interface DefiFeesData {
  entries: DefiFeesEntry[];
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
  btc_mempool?: BtcMempoolData;
  stablecoins?: StablecoinData;
  sol_tvl?: SolTvlData;
  ai_agent_tokens?: AiAgentTokensData;
  sol_revenue?: SolRevenueData;
  eth_gas?: EthGasData;
  global_market?: GlobalMarketData;
  l2_tvl?: L2TvlData;
  sol_lst?: SolLstData;
  polymarket_data?: PolymarketData;
  narratives?: NarrativeData;
  defi_fees?: DefiFeesData;
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

/**
 * Fetches Bitcoin mempool stats and recommended fee rates from mempool.space.
 * Shows pending tx count, mempool size, and fee rates (fastest/30min/1h) in sat/vB.
 * High fee rates signal network congestion; useful as a Bitcoin on-chain health signal.
 */
export async function deliverBtcMempool(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let btc_mempool: BtcMempoolData | undefined;

  try {
    const [mempoolRes, feesRes] = await Promise.all([
      fetch("https://mempool.space/api/mempool", {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      }),
      fetch("https://mempool.space/api/v1/fees/recommended", {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    if (mempoolRes.ok && feesRes.ok) {
      const mempoolData = (await mempoolRes.json()) as {
        count: number;
        vsize: number;
        total_fee: number;
      };
      const feesData = (await feesRes.json()) as {
        fastestFee: number;
        halfHourFee: number;
        hourFee: number;
        economyFee: number;
        minimumFee: number;
      };

      btc_mempool = {
        count: mempoolData.count,
        vsize_mb: parseFloat((mempoolData.vsize / 1_000_000).toFixed(2)),
        fee_fastest: feesData.fastestFee,
        fee_30min: feesData.halfHourFee,
        fee_60min: feesData.hourFee,
      };
    }
  } catch {
    // Fall through with undefined btc_mempool
  }

  const result = btc_mempool
    ? `${btc_mempool.count.toLocaleString()} pending txs | ${btc_mempool.vsize_mb} MB | Fast: ${btc_mempool.fee_fastest} sat/vB | 30min: ${btc_mempool.fee_30min} sat/vB | 1h: ${btc_mempool.fee_60min} sat/vB`
    : "Bitcoin mempool data temporarily unavailable";

  return { service_type: "btc-mempool", result, btc_mempool, timestamp, delivered_to };
}

/**
 * Fetches top stablecoins by circulating supply from DeFi Llama.
 * Shows USDT, USDC, DAI, USDe, USDS, and more with 24h supply change.
 * Total stablecoin market cap is a key "dry powder" indicator for crypto markets.
 */
export async function deliverStablecoins(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let stablecoins: StablecoinData | undefined;

  try {
    const res = await fetch("https://stablecoins.llama.fi/stablecoins?includePrices=true", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        peggedAssets: Array<{
          name: string;
          symbol: string;
          pegMechanism: string;
          circulating: { peggedUSD?: number };
          circulatingPrevDay: { peggedUSD?: number };
        }>;
      };

      const coins: StablecoinEntry[] = (data.peggedAssets ?? [])
        .filter((s) => (s.circulating?.peggedUSD ?? 0) > 100_000_000) // >$100M supply only
        .sort((a, b) => (b.circulating?.peggedUSD ?? 0) - (a.circulating?.peggedUSD ?? 0))
        .slice(0, 8)
        .map((s) => {
          const current = s.circulating?.peggedUSD ?? 0;
          const prev = s.circulatingPrevDay?.peggedUSD ?? current;
          const change_24h_pct = prev > 0 ? parseFloat((((current - prev) / prev) * 100).toFixed(3)) : 0;
          return {
            symbol: s.symbol,
            name: s.name,
            supply_usd: current,
            change_24h_pct,
            peg_mechanism: s.pegMechanism ?? "unknown",
          };
        });

      if (coins.length > 0) {
        const total_supply_usd = coins.reduce((sum, c) => sum + c.supply_usd, 0);
        stablecoins = { coins, total_supply_usd };
      }
    }
  } catch {
    // Fall through with undefined stablecoins
  }

  const formatBillions = (v: number) =>
    v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`;

  const result =
    stablecoins && stablecoins.coins.length > 0
      ? stablecoins.coins
          .slice(0, 4)
          .map((c) => `${c.symbol} ${formatBillions(c.supply_usd)}`)
          .join(" | ")
      : "Stablecoin data temporarily unavailable";

  return { service_type: "stablecoins", result, stablecoins, timestamp, delivered_to };
}

/**
 * Fetches top Solana-native DeFi protocols ranked by TVL from DeFi Llama.
 * Covers Lending, Liquid Staking, DEXs, Derivatives, and more.
 * Shows where capital is deployed on Solana — a structural health indicator.
 */
export async function deliverSolTvl(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let sol_tvl: SolTvlData | undefined;

  try {
    const res = await fetch("https://api.llama.fi/protocols", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
    });

    if (res.ok) {
      const data = (await res.json()) as Array<{
        name: string;
        category: string;
        chains: string[];
        tvl: number;
        change_1d?: number;
      }>;

      const protocols: SolTvlProtocol[] = data
        .filter(
          (p) =>
            Array.isArray(p.chains) &&
            p.chains[0] === "Solana" &&
            p.category !== "CEX" &&
            (p.tvl ?? 0) > 10_000_000
        )
        .sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0))
        .slice(0, 8)
        .map((p) => ({
          name: p.name,
          category: p.category ?? "DeFi",
          tvl_usd: p.tvl ?? 0,
          change_1d_pct: parseFloat((p.change_1d ?? 0).toFixed(2)),
        }));

      if (protocols.length > 0) {
        const total_tvl_usd = protocols.reduce((sum, p) => sum + p.tvl_usd, 0);
        sol_tvl = { protocols, total_tvl_usd };
      }
    }
  } catch {
    // Fall through with undefined sol_tvl
  }

  const formatTvl = (v: number) =>
    v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`;

  const result =
    sol_tvl && sol_tvl.protocols.length > 0
      ? sol_tvl.protocols
          .slice(0, 4)
          .map((p) => `${p.name} ${formatTvl(p.tvl_usd)}`)
          .join(" | ")
      : "Solana DeFi TVL data temporarily unavailable";

  return { service_type: "sol-protocol-tvl", result, sol_tvl, timestamp, delivered_to };
}

export async function deliverAiAgentTokens(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let ai_agent_tokens: AiAgentTokensData | undefined;

  try {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=ai-agents&order=market_cap_desc&per_page=8&page=1&price_change_percentage=24h";
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (res.ok) {
      const data = await res.json() as Array<{
        symbol: string;
        name: string;
        current_price: number;
        price_change_percentage_24h: number | null;
        market_cap: number;
        market_cap_rank: number;
      }>;

      const tokens: AiAgentToken[] = data
        .filter((d) => d.current_price != null && d.market_cap != null)
        .map((d) => ({
          symbol: d.symbol.toUpperCase(),
          name: d.name,
          price_usd: d.current_price,
          change_24h_pct: parseFloat((d.price_change_percentage_24h ?? 0).toFixed(2)),
          market_cap_usd: d.market_cap,
          market_cap_rank: d.market_cap_rank,
        }));

      if (tokens.length > 0) {
        ai_agent_tokens = { tokens };
      }
    }
  } catch {
    // Fall through with undefined ai_agent_tokens
  }

  const formatMcap = (v: number) =>
    v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(2)}B` : `$${(v / 1_000_000).toFixed(0)}M`;

  const result =
    ai_agent_tokens && ai_agent_tokens.tokens.length > 0
      ? ai_agent_tokens.tokens
          .slice(0, 4)
          .map((t) => `${t.symbol} ${formatMcap(t.market_cap_usd)} (${t.change_24h_pct >= 0 ? "+" : ""}${t.change_24h_pct}%)`)
          .join(" | ")
      : "AI agent token data temporarily unavailable";

  return { service_type: "ai-agent-tokens", result, ai_agent_tokens, timestamp, delivered_to };
}

/**
 * Fetches 24h fee revenue for top Solana protocols from DeFi Llama.
 * Shows which protocols are earning the most real revenue — from trading fees,
 * launchpad cuts, and perpetual funding — a direct measure of on-chain activity.
 * PumpSwap, pump.fun, and Jupiter Perpetuals consistently lead.
 */
export async function deliverSolRevenue(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let sol_revenue: SolRevenueData | undefined;

  // Categories to exclude — "Chain" is just base-layer validator income, not protocol revenue
  const EXCLUDE_CATEGORIES = new Set(["Chain"]);

  try {
    const res = await fetch(
      "https://api.llama.fi/overview/fees?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true",
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(12000),
      }
    );

    if (res.ok) {
      const data = (await res.json()) as {
        protocols: Array<{
          name: string;
          category: string;
          chains: string[];
          total24h: number | null;
          total7d: number | null;
        }>;
      };

      const protocols: SolRevenueProtocol[] = (data.protocols ?? [])
        .filter(
          (p) =>
            Array.isArray(p.chains) &&
            p.chains.includes("Solana") &&
            !EXCLUDE_CATEGORIES.has(p.category) &&
            (p.total24h ?? 0) > 0
        )
        .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
        .slice(0, 8)
        .map((p) => ({
          name: p.name,
          category: p.category ?? "DeFi",
          revenue_24h: p.total24h ?? 0,
          revenue_7d: p.total7d ?? 0,
        }));

      if (protocols.length > 0) {
        const total_revenue_24h = protocols.reduce((sum, p) => sum + p.revenue_24h, 0);
        sol_revenue = { protocols, total_revenue_24h };
      }
    }
  } catch {
    // Fall through with undefined sol_revenue
  }

  const formatRev = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${(v / 1_000).toFixed(0)}K`;

  const result =
    sol_revenue && sol_revenue.protocols.length > 0
      ? sol_revenue.protocols
          .slice(0, 4)
          .map((p) => `${p.name} ${formatRev(p.revenue_24h)}/24h`)
          .join(" | ")
      : "Protocol revenue data temporarily unavailable";

  return { service_type: "sol-revenue", result, sol_revenue, timestamp, delivered_to };
}

/**
 * Fetches live Ethereum gas prices from Owlracle free API and ETH price from CoinGecko.
 * Shows Slow / Standard / Fast / Rapid speed tiers with Gwei and estimated transfer cost in USD.
 */
export async function deliverEthGas(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let eth_gas: EthGasData | undefined;

  const LABELS = ["Slow", "Standard", "Fast", "Rapid"];
  const WAITS  = ["~5+ min", "~1–3 min", "~30s", "~15s"];

  try {
    const [gasRes, priceRes] = await Promise.all([
      fetch("https://api.owlracle.info/v3/eth/gas", {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      }),
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
        {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(8000),
        }
      ),
    ]);

    if (gasRes.ok && priceRes.ok) {
      const gasData = (await gasRes.json()) as {
        speeds: Array<{
          maxFeePerGas: number;
          baseFee: number;
        }>;
      };
      const priceData = (await priceRes.json()) as {
        ethereum?: { usd: number };
      };

      const ethPrice = priceData.ethereum?.usd ?? 0;
      const speeds = gasData.speeds ?? [];
      const baseFee = speeds[0]?.baseFee ?? 0;

      const levels: EthGasLevel[] = speeds.slice(0, 4).map((s, i) => {
        const gweiVal = s.maxFeePerGas ?? 0;
        const costEth = gweiVal * 1e-9 * 21_000;
        const costUsd = Math.round(costEth * ethPrice * 100000) / 100000;
        return {
          label: LABELS[i] ?? `Tier ${i + 1}`,
          gwei: Math.round(gweiVal * 1000) / 1000,
          wait: WAITS[i] ?? "unknown",
          cost_usd: costUsd,
        };
      });

      if (levels.length > 0) {
        eth_gas = {
          levels,
          eth_price_usd: ethPrice,
          base_fee_gwei: Math.round(baseFee * 1000) / 1000,
        };
      }
    }
  } catch {
    // Fall through with undefined eth_gas
  }

  const result =
    eth_gas && eth_gas.levels.length > 0
      ? `Base: ${eth_gas.base_fee_gwei} Gwei | ` +
        eth_gas.levels
          .slice(1, 4)
          .map((l) => `${l.label}: ${l.gwei} Gwei`)
          .join(" | ")
      : "Ethereum gas data temporarily unavailable";

  return { service_type: "eth-gas", result, eth_gas, timestamp, delivered_to };
}

/**
 * Fetches the global crypto market overview from CoinGecko.
 * Returns total market cap, 24h volume, BTC/ETH dominance, and DeFi stats.
 */
export async function deliverGlobalMarket(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let global_market: GlobalMarketData | undefined;

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/global", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const json = (await res.json()) as {
        data: {
          total_market_cap: Record<string, number>;
          total_volume: Record<string, number>;
          market_cap_change_percentage_24h_usd: number;
          market_cap_percentage: Record<string, number>;
          active_cryptocurrencies: number;
          defi_market_cap?: number;
          defi_volume_24h?: number;
          stablecoin_volume_24h?: number;
          total_market_cap_normalized?: number;
        };
      };

      const d = json.data;
      global_market = {
        total_market_cap_usd: d.total_market_cap?.usd ?? 0,
        total_volume_24h_usd: d.total_volume?.usd ?? 0,
        market_cap_change_24h_pct: d.market_cap_change_percentage_24h_usd ?? 0,
        btc_dominance: d.market_cap_percentage?.btc ?? 0,
        eth_dominance: d.market_cap_percentage?.eth ?? 0,
        active_cryptos: d.active_cryptocurrencies ?? 0,
        defi_market_cap_usd: d.defi_market_cap ?? 0,
        stablecoin_volume_24h_usd: d.stablecoin_volume_24h ?? 0,
      };
    }
  } catch {
    // Fall through with undefined global_market
  }

  const fmt = (n: number): string => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9)  return `$${(n / 1e9).toFixed(1)}B`;
    return `$${(n / 1e6).toFixed(0)}M`;
  };

  const result = global_market
    ? `Market: ${fmt(global_market.total_market_cap_usd)} (${global_market.market_cap_change_24h_pct >= 0 ? "+" : ""}${global_market.market_cap_change_24h_pct.toFixed(1)}%) | BTC ${global_market.btc_dominance.toFixed(1)}% | ETH ${global_market.eth_dominance.toFixed(1)}% | Vol: ${fmt(global_market.total_volume_24h_usd)}`
    : "Global market data temporarily unavailable";

  return { service_type: "global-market", result, global_market, timestamp, delivered_to };
}

const L2_CHAIN_NAMES = ["Arbitrum", "Base", "OP Mainnet", "zkSync Era", "Starknet", "Scroll", "Linea", "Blast", "Polygon zkEVM", "Manta", "Taiko", "Mode"];

export async function deliverL2Tvl(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let l2_tvl: L2TvlData | undefined;

  try {
    const res = await fetch("https://api.llama.fi/v2/chains", { headers: { Accept: "application/json" } });
    if (res.ok) {
      const data = await res.json() as Array<{
        name: string;
        tvl: number;
        change_1d: number | null;
      }>;

      const chains: L2Chain[] = data
        .filter((c) => L2_CHAIN_NAMES.includes(c.name) && c.tvl > 0)
        .map((c) => ({
          name: c.name === "OP Mainnet" ? "Optimism" : c.name,
          tvl_usd: c.tvl,
          change_1d_pct: parseFloat((c.change_1d ?? 0).toFixed(2)),
        }))
        .sort((a, b) => b.tvl_usd - a.tvl_usd)
        .slice(0, 8);

      if (chains.length > 0) {
        l2_tvl = {
          chains,
          total_tvl_usd: chains.reduce((sum, c) => sum + c.tvl_usd, 0),
        };
      }
    }
  } catch {
    // Fall through with undefined l2_tvl
  }

  const formatTvl = (v: number) =>
    v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`;

  const result =
    l2_tvl && l2_tvl.chains.length > 0
      ? l2_tvl.chains
          .slice(0, 4)
          .map((c) => `${c.name} ${formatTvl(c.tvl_usd)}`)
          .join(" | ")
      : "L2 TVL data temporarily unavailable";

  return { service_type: "l2-tvl", result, l2_tvl, timestamp, delivered_to };
}

// Known Solana liquid staking projects in DeFi Llama yields API
const SOL_LST_PROJECTS = new Set([
  "jito-liquid-staking",
  "marinade-liquid-staking",
  "jupiter-staked-sol",
  "drift-staked-sol",
  "blazestake",
  "phantom-sol",
  "bybit-staked-sol",
  "jpool",
  "binance-staked-sol",
  "the-vault-liquid-staking",
  "doublezero-staked-sol",
]);

export async function deliverSolLst(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let sol_lst: SolLstData | undefined;

  try {
    const res = await fetch("https://yields.llama.fi/pools", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const json = await res.json() as { data: Array<{
        project: string;
        symbol: string;
        chain: string;
        apy: number | null;
        tvlUsd: number | null;
      }> };
      const data = json.data ?? [];

      const tokens: SolLstToken[] = data
        .filter((p) => p.chain === "Solana" && SOL_LST_PROJECTS.has(p.project) && (p.apy ?? 0) > 0 && (p.tvlUsd ?? 0) > 1_000_000)
        .map((p) => ({
          symbol: p.symbol,
          project: p.project.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          apy: parseFloat((p.apy ?? 0).toFixed(2)),
          tvl_usd: p.tvlUsd ?? 0,
        }))
        .sort((a, b) => b.tvl_usd - a.tvl_usd)
        .slice(0, 8);

      if (tokens.length > 0) {
        const avg_apy = parseFloat((tokens.reduce((s, t) => s + t.apy, 0) / tokens.length).toFixed(2));
        sol_lst = { tokens, avg_apy };
      }
    }
  } catch {
    // Fall through with undefined sol_lst
  }

  const fmtTvl = (v: number) =>
    v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`;

  const result =
    sol_lst && sol_lst.tokens.length > 0
      ? sol_lst.tokens
          .slice(0, 4)
          .map((t) => `${t.symbol} ${t.apy.toFixed(1)}% APY`)
          .join(" | ")
      : "Solana LST yield data temporarily unavailable";

  return { service_type: "sol-lst", result, sol_lst, timestamp, delivered_to };
}

export async function deliverPolymarket(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let polymarket_data: PolymarketData | undefined;

  try {
    const res = await fetch(
      "https://gamma-api.polymarket.com/markets?limit=20&active=true&closed=false&order=volume24hr&ascending=false",
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) }
    );
    if (res.ok) {
      const json = await res.json() as Array<{
        question: string;
        outcomes: string;
        outcomePrices: string;
        volume24hr: number | string;
      }>;

      const markets: PolymarketEntry[] = json
        .filter((m) => m.question && m.outcomePrices)
        .map((m) => {
          const outcomes: string[] = typeof m.outcomes === "string" ? JSON.parse(m.outcomes) : m.outcomes;
          const rawPrices: string[] = typeof m.outcomePrices === "string" ? JSON.parse(m.outcomePrices) : m.outcomePrices;
          const prices = rawPrices.map((p) => parseFloat(parseFloat(p).toFixed(3)));
          return {
            question: m.question.length > 70 ? m.question.slice(0, 67) + "…" : m.question,
            outcomes,
            prices,
            volume_24h: parseFloat(String(m.volume24hr ?? 0)),
          };
        })
        // Filter out effectively-resolved markets (any outcome > 97% certain)
        .filter((m) => m.prices.every((p) => p < 0.97))
        .slice(0, 8);

      if (markets.length > 0) {
        const total_volume_24h = markets.reduce((s, m) => s + m.volume_24h, 0);
        polymarket_data = { markets, total_volume_24h };
      }
    }
  } catch {
    // Fall through with undefined polymarket_data
  }

  const fmtVol = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;

  const result =
    polymarket_data && polymarket_data.markets.length > 0
      ? polymarket_data.markets
          .slice(0, 3)
          .map((m) => `${m.question.slice(0, 35)}… ${fmtVol(m.volume_24h)} 24h`)
          .join(" | ")
      : "Prediction market data temporarily unavailable";

  return { service_type: "polymarket", result, polymarket_data, timestamp, delivered_to };
}

export async function deliverNarratives(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let narratives_data: NarrativeData | undefined;

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/categories?order=market_cap_desc",
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) }
    );
    if (res.ok) {
      const json = await res.json() as Array<{
        name: string;
        market_cap: number | null;
        market_cap_change_24h: number | null;
        volume_24h: number | null;
        top_3_coins_id: string[];
      }>;

      // Filter to categories with meaningful market cap, then sort by 24h change
      const entries: NarrativeEntry[] = json
        .filter((d) => (d.market_cap ?? 0) >= 1_000_000_000)
        .sort((a, b) => (b.market_cap_change_24h ?? 0) - (a.market_cap_change_24h ?? 0))
        .slice(0, 12)
        .map((d) => ({
          name: d.name,
          market_cap: d.market_cap ?? 0,
          change_24h_pct: d.market_cap_change_24h ?? 0,
          volume_24h: d.volume_24h ?? 0,
          top_coins: (d.top_3_coins_id ?? []).slice(0, 3).map((id) =>
            id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
          ),
        }));

      if (entries.length > 0) {
        narratives_data = { narratives: entries };
      }
    }
  } catch {
    // Fall through with undefined narratives_data
  }

  const result =
    narratives_data && narratives_data.narratives.length > 0
      ? narratives_data.narratives
          .slice(0, 3)
          .map((n) => `${n.name} ${n.change_24h_pct >= 0 ? "+" : ""}${n.change_24h_pct.toFixed(1)}%`)
          .join(" | ")
      : "Narrative performance data temporarily unavailable";

  return { service_type: "narratives", result, narratives: narratives_data, timestamp, delivered_to };
}

export async function deliverDefiFees(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let defi_fees: DefiFeesData | undefined;

  try {
    const res = await fetch(
      "https://api.llama.fi/overview/fees?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true&dataType=dailyFees",
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(12000) }
    );
    if (res.ok) {
      const json = await res.json() as {
        protocols: Array<{
          name: string;
          displayName?: string;
          category: string;
          chains: string[];
          total24h: number | null;
          total30d: number | null;
          change_1m: number | null;
        }>;
      };

      const entries: DefiFeesEntry[] = json.protocols
        // Exclude purely off-chain protocols (stablecoin issuers w/ no on-chain activity listed)
        .filter((p) => !(p.chains.length === 1 && p.chains[0] === "Off Chain"))
        .filter((p) => (p.total30d ?? 0) > 0)
        .sort((a, b) => (b.total30d ?? 0) - (a.total30d ?? 0))
        .slice(0, 12)
        .map((p) => ({
          name: p.displayName ?? p.name,
          category: p.category,
          total30d: p.total30d ?? 0,
          total24h: p.total24h ?? 0,
          change_1m: p.change_1m ?? null,
          chains: (p.chains ?? []).filter((c) => c !== "Off Chain").slice(0, 2),
        }));

      if (entries.length > 0) {
        defi_fees = { entries };
      }
    }
  } catch {
    // Fall through with undefined defi_fees
  }

  const fmtFee = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;

  const result =
    defi_fees && defi_fees.entries.length > 0
      ? defi_fees.entries
          .slice(0, 3)
          .map((e) => `${e.name} ${fmtFee(e.total30d)} 30d`)
          .join(" | ")
      : "DeFi fee data temporarily unavailable";

  return { service_type: "defi-fees", result, defi_fees, timestamp, delivered_to };
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
  if (serviceType === "btc-mempool") return deliverBtcMempool(delivered_to, timestamp);
  if (serviceType === "stablecoins") return deliverStablecoins(delivered_to, timestamp);
  if (serviceType === "sol-protocol-tvl") return deliverSolTvl(delivered_to, timestamp);
  if (serviceType === "ai-agent-tokens") return deliverAiAgentTokens(delivered_to, timestamp);
  if (serviceType === "sol-revenue") return deliverSolRevenue(delivered_to, timestamp);
  if (serviceType === "eth-gas") return deliverEthGas(delivered_to, timestamp);
  if (serviceType === "global-market") return deliverGlobalMarket(delivered_to, timestamp);
  if (serviceType === "l2-tvl") return deliverL2Tvl(delivered_to, timestamp);
  if (serviceType === "sol-lst") return deliverSolLst(delivered_to, timestamp);
  if (serviceType === "polymarket") return deliverPolymarket(delivered_to, timestamp);
  if (serviceType === "narratives") return deliverNarratives(delivered_to, timestamp);
  if (serviceType === "defi-fees") return deliverDefiFees(delivered_to, timestamp);
  return deliverCryptoPrices(delivered_to, timestamp);
}
