/**
 * Data-fetching functions shared between /api/preview (free) and /api/verify (post-payment).
 * All functions are read-only calls to public APIs — no auth required.
 */

export type ServiceType = "crypto-prices" | "solana-stats" | "defi-yields" | "fear-greed" | "solana-ecosystem" | "ai-models" | "trending-coins" | "top-gainers" | "dex-volume" | "pumpfun-tokens" | "pump-new" | "funding-rates" | "btc-mempool" | "stablecoins" | "sol-protocol-tvl" | "ai-agent-tokens" | "sol-revenue" | "eth-gas" | "global-market" | "l2-tvl" | "sol-lst" | "polymarket" | "narratives" | "defi-fees" | "cex-volume" | "options-oi" | "options-max-pain" | "btc-rainbow" | "altcoin-season" | "btc-mining" | "bridge-volume" | "tvl-movers" | "lightning-network" | "eth-lst" | "realized-vol" | "lending-rates" | "protocol-revenue";

/** All valid service type strings — use this for runtime validation instead of duplicating the list. */
export const ALL_SERVICE_TYPES: ServiceType[] = ["crypto-prices", "solana-stats", "defi-yields", "fear-greed", "solana-ecosystem", "ai-models", "trending-coins", "top-gainers", "dex-volume", "pumpfun-tokens", "pump-new", "funding-rates", "btc-mempool", "stablecoins", "sol-protocol-tvl", "ai-agent-tokens", "sol-revenue", "eth-gas", "global-market", "l2-tvl", "sol-lst", "polymarket", "narratives", "defi-fees", "cex-volume", "options-oi", "options-max-pain", "btc-rainbow", "altcoin-season", "btc-mining", "bridge-volume", "tvl-movers", "lightning-network", "eth-lst", "realized-vol", "lending-rates", "protocol-revenue"];

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

export interface ProtocolRevenueEntry {
  name: string;
  category: string;
  revenue_30d: number;
  revenue_24h: number;
  change_1m: number | null;
  chains: string[];
}

export interface ProtocolRevenueData {
  entries: ProtocolRevenueEntry[];
}

export interface CexExchange {
  rank: number;
  name: string;
  volume_btc_24h: number;
  volume_usd_24h: number;
  trust_score: number;
  year_established: number | null;
  country: string | null;
}

export interface CexVolumeData {
  exchanges: CexExchange[];
  btc_price_usd: number;
}

export interface OptionsOIAsset {
  asset: string;          // "BTC" or "ETH"
  price_usd: number;
  total_oi_usd: number;
  call_oi_usd: number;
  put_oi_usd: number;
  put_call_ratio: number;
  top_expiry: string;     // e.g. "28MAR25"
  top_expiry_oi_usd: number;
}

export interface OptionsOIData {
  assets: OptionsOIAsset[];
}

export interface MaxPainAsset {
  asset: string;           // "BTC" or "ETH"
  spot_usd: number;
  max_pain_strike: number;
  distance_pct: number;    // (max_pain - spot) / spot * 100
  direction: "above" | "below" | "at";
  expiry: string;          // e.g. "27MAR26"
  expiry_oi_contracts: number;  // total OI at this expiry in native units
}

export interface OptionsMaxPainData {
  assets: MaxPainAsset[];
}

export interface BtcRainbowBand {
  index: number;          // 1 (fire sale) to 9 (max bubble)
  label: string;          // human-readable band name
  color: string;          // hex color for display
}

export interface BtcRainbowData {
  current_price_usd: number;     // live BTC spot price
  model_price_usd: number;       // power-law model "fair value"
  ratio: number;                 // current_price / model_price
  days_since_genesis: number;    // days since BTC genesis block (Jan 3, 2009)
  band: BtcRainbowBand;          // which rainbow band the current price is in
  interpretation: string;        // short human-readable market context
}

export interface AltcoinSeasonCoin {
  symbol: string;
  name: string;
  change_30d_pct: number;
  outperformed_btc: boolean;
}

export interface AltcoinSeasonData {
  score: number;                 // 0–100: % of top coins that outperformed BTC over 30d
  btc_change_30d_pct: number;    // BTC's own 30d performance
  total_coins: number;           // non-stablecoin coins evaluated
  outperforming: number;         // how many outperformed BTC
  signal: "bitcoin" | "altcoin" | "neutral";
  signal_label: string;          // human-readable
  top_performers: AltcoinSeasonCoin[];    // top 5 by 30d gain
  bottom_performers: AltcoinSeasonCoin[]; // bottom 5 by 30d gain
}

export interface BtcMiningData {
  hashrate_eh: number;           // current estimated hashrate in EH/s
  difficulty_change_pct: number; // expected % change at next retarget (negative = easier)
  progress_pct: number;          // % through current 2016-block epoch
  remaining_blocks: number;      // blocks until next retarget
  estimated_retarget_date: string; // ISO date string of next retarget
  days_until_retarget: number;   // calendar days until next retarget
  prev_retarget_pct: number;     // % change at the previous retarget
  next_retarget_height: number;  // block height of next retarget
  avg_block_time_sec: number;    // current average block time in seconds
}

export interface BridgeEntry {
  name: string;            // display name, e.g. "LayerZero"
  volume_24h_usd: number;  // 24h volume in USD
  volume_7d_usd: number;   // 7d volume in USD
  chains: number;          // number of supported chains
}

export interface BridgeVolumeData {
  bridges: BridgeEntry[];         // top bridges by 24h volume
  total_24h_usd: number;          // sum of all bridge 24h volume
  total_7d_usd: number;           // sum of all bridge 7d volume
}

export interface TvlMoverEntry {
  name: string;          // protocol display name
  chain: string;         // primary chain or "Multi-chain"
  category: string;      // DeFi category (e.g. "Dexes", "Lending")
  tvl_usd: number;       // current TVL in USD
  change_7d_pct: number; // 7-day % TVL change
}

export interface TvlMoversData {
  gainers: TvlMoverEntry[];  // top 5 biggest 7-day TVL gainers
  losers: TvlMoverEntry[];   // top 5 biggest 7-day TVL losers
  total_defi_tvl: number;    // total DeFi TVL across all protocols
}

export interface LightningNetworkData {
  channel_count: number;        // total payment channels
  node_count: number;           // total routing nodes
  total_capacity_btc: number;   // total locked liquidity in BTC
  avg_channel_btc: number;      // average channel capacity in BTC
  tor_nodes: number;            // nodes running over Tor
  avg_fee_rate: number;         // average fee rate in ppm
  channel_count_change: number; // change from previous week
  node_count_change: number;    // change from previous week
  capacity_change_btc: number;  // capacity change from previous week in BTC
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
  cex_volume?: CexVolumeData;
  options_oi?: OptionsOIData;
  options_max_pain?: OptionsMaxPainData;
  btc_rainbow?: BtcRainbowData;
  altcoin_season?: AltcoinSeasonData;
  btc_mining?: BtcMiningData;
  bridge_volume?: BridgeVolumeData;
  tvl_movers?: TvlMoversData;
  lightning_network?: LightningNetworkData;
  eth_lst?: SolLstData;
  realized_vol?: RealizedVolData;
  lending_rates?: LendingRatesData;
  protocol_revenue?: ProtocolRevenueData;
  timestamp: string;
  delivered_to: string;
}

// Re-export SolLstData shape under the ETH LST name for use in PaymentFlow
export type EthLstData = SolLstData;

export interface VolatilityEntry {
  symbol: string;
  vol_30d_pct: number;
  vol_7d_pct: number;
  regime: "escalating" | "stable" | "cooling";
}

export interface RealizedVolData {
  assets: VolatilityEntry[];
  market_regime: "escalating" | "stable" | "cooling";
}

export interface LendingRateEntry {
  protocol: string;
  chain: string;
  symbol: string;
  supply_apy: number;
  tvl_usd: number;
}

export interface LendingRatesData {
  pools: LendingRateEntry[];
  best_stable_apy: number;
  best_stable_protocol: string;
  best_eth_apy: number;
  best_eth_protocol: string;
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

const ETH_LST_PROJECTS = new Set([
  "lido", "rocket-pool", "frax-ether", "coinbase-wrapped-staked-eth",
  "mantle-staked-eth", "stakewise", "swell-liquid-staking", "origin-ether",
  "stader", "ankr",
]);

/**
 * Fetches Ethereum liquid staking token (LST) yields from DeFi Llama.
 * Shows APY and TVL for stETH, rETH, cbETH, mETH and other major ETH LSTs.
 */
export async function deliverEthLst(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let eth_lst: SolLstData | undefined;

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
        .filter((p) => p.chain === "Ethereum" && ETH_LST_PROJECTS.has(p.project) && (p.apy ?? 0) > 0 && (p.tvlUsd ?? 0) > 10_000_000)
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
        eth_lst = { tokens, avg_apy };
      }
    }
  } catch {
    // Fall through with undefined eth_lst
  }

  const fmtTvl = (v: number) =>
    v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`;

  const result =
    eth_lst && eth_lst.tokens.length > 0
      ? eth_lst.tokens
          .slice(0, 4)
          .map((t) => `${t.symbol} ${t.apy.toFixed(1)}% APY (${fmtTvl(t.tvl_usd)})`)
          .join(" | ")
      : "Ethereum LST yield data temporarily unavailable";

  return { service_type: "eth-lst", result, eth_lst, timestamp, delivered_to };
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

export async function deliverCexVolume(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let cex_volume: CexVolumeData | undefined;

  try {
    // Fetch BTC price and top exchanges in parallel
    const [btcRes, exchangesRes] = await Promise.all([
      fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
        { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) }
      ),
      fetch(
        "https://api.coingecko.com/api/v3/exchanges?per_page=10&page=1",
        { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10000) }
      ),
    ]);

    if (btcRes.ok && exchangesRes.ok) {
      const btcData = (await btcRes.json()) as { bitcoin: { usd: number } };
      const btcPrice = btcData.bitcoin.usd;

      const rawExchanges = (await exchangesRes.json()) as Array<{
        id: string;
        name: string;
        trust_score: number | null;
        trust_score_rank: number;
        trade_volume_24h_btc: number;
        year_established: number | null;
        country: string | null;
      }>;

      const exchanges: CexExchange[] = rawExchanges
        .filter((e) => e.trade_volume_24h_btc > 0)
        .slice(0, 10)
        .map((e, i) => ({
          rank: i + 1,
          name: e.name,
          volume_btc_24h: Math.round(e.trade_volume_24h_btc),
          volume_usd_24h: Math.round(e.trade_volume_24h_btc * btcPrice),
          trust_score: e.trust_score ?? 0,
          year_established: e.year_established,
          country: e.country,
        }));

      if (exchanges.length > 0) {
        cex_volume = { exchanges, btc_price_usd: btcPrice };
      }
    }
  } catch {
    // Fall through with undefined cex_volume
  }

  const fmtVol = (v: number) =>
    v >= 1_000_000_000
      ? `$${(v / 1_000_000_000).toFixed(1)}B`
      : `$${(v / 1_000_000).toFixed(0)}M`;

  const result =
    cex_volume && cex_volume.exchanges.length > 0
      ? cex_volume.exchanges
          .slice(0, 3)
          .map((e) => `${e.name} ${fmtVol(e.volume_usd_24h)}`)
          .join(" | ")
      : "CEX volume data temporarily unavailable";

  return { service_type: "cex-volume", result, cex_volume, timestamp, delivered_to };
}

export async function deliverOptionsOI(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let options_oi: OptionsOIData | undefined;

  try {
    // Fetch BTC and ETH options summaries from Deribit's free public API in parallel
    const [btcRes, ethRes] = await Promise.all([
      fetch(
        "https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=BTC&kind=option",
        { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000) }
      ),
      fetch(
        "https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=ETH&kind=option",
        { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15000) }
      ),
    ]);

    interface DeribitBookEntry {
      instrument_name: string;   // e.g. "BTC-28MAR25-100000-C"
      open_interest: number;     // in base currency (BTC or ETH)
      underlying_price: number;  // current spot price
    }
    interface DeribitResponse {
      result: DeribitBookEntry[];
    }

    const assets: OptionsOIAsset[] = [];

    for (const [res, assetName] of [[btcRes, "BTC"], [ethRes, "ETH"]] as [Response, string][]) {
      if (!res.ok) continue;
      const json = (await res.json()) as DeribitResponse;
      const instruments = json.result ?? [];

      // Use the first instrument's underlying_price as the spot price
      const spotPrice = instruments.find((i) => i.underlying_price > 0)?.underlying_price ?? 0;
      if (spotPrice === 0) continue;

      let callOI = 0;
      let putOI = 0;

      // Map: expiry -> total OI in base currency
      const expiryOI = new Map<string, number>();

      for (const inst of instruments) {
        if (inst.open_interest <= 0) continue;
        // Instrument name format: BTC-28MAR25-100000-C
        const parts = inst.instrument_name.split("-");
        if (parts.length < 4) continue;
        const expiry = parts[1];            // e.g. "28MAR25"
        const optType = parts[parts.length - 1]; // "C" or "P"

        if (optType === "C") callOI += inst.open_interest;
        else if (optType === "P") putOI += inst.open_interest;

        expiryOI.set(expiry, (expiryOI.get(expiry) ?? 0) + inst.open_interest);
      }

      const totalOI = callOI + putOI;
      if (totalOI === 0) continue;

      // Find the expiry with the most OI
      let topExpiry = "";
      let topExpiryOI = 0;
      for (const [expiry, oi] of expiryOI.entries()) {
        if (oi > topExpiryOI) { topExpiryOI = oi; topExpiry = expiry; }
      }

      assets.push({
        asset: assetName,
        price_usd: Math.round(spotPrice),
        total_oi_usd: Math.round(totalOI * spotPrice),
        call_oi_usd: Math.round(callOI * spotPrice),
        put_oi_usd: Math.round(putOI * spotPrice),
        put_call_ratio: parseFloat((putOI / callOI).toFixed(2)),
        top_expiry: topExpiry,
        top_expiry_oi_usd: Math.round(topExpiryOI * spotPrice),
      });
    }

    if (assets.length > 0) {
      options_oi = { assets };
    }
  } catch {
    // Fall through with undefined options_oi
  }

  const fmtOI = (v: number) =>
    v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`;

  const result =
    options_oi && options_oi.assets.length > 0
      ? options_oi.assets
          .map((a) => `${a.asset} OI ${fmtOI(a.total_oi_usd)} P/C ${a.put_call_ratio}`)
          .join(" | ")
      : "Options OI data temporarily unavailable";

  return { service_type: "options-oi", result, options_oi, timestamp, delivered_to };
}

export async function deliverOptionsMaxPain(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let options_max_pain: OptionsMaxPainData | undefined;

  interface DeribitSummaryItem {
    instrument_name: string;
    open_interest: number;
    underlying_price: number;
  }
  interface DeribitResponse {
    result: DeribitSummaryItem[];
  }

  const MONTHS: Record<string, number> = {
    JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
    JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
  };

  function parseExpiry(s: string): Date | null {
    const m = s.match(/^(\d{1,2})([A-Z]{3})(\d{2})$/);
    if (!m) return null;
    const month = MONTHS[m[2]];
    if (!month) return null;
    return new Date(Date.UTC(2000 + parseInt(m[3]), month - 1, parseInt(m[1])));
  }

  function computeMaxPain(
    strikeData: Map<number, { call: number; put: number; spot: number }>
  ): { max_pain_strike: number; spot: number; total_oi: number } {
    const entries = Array.from(strikeData.entries());
    const spot = entries.find(([, v]) => v.spot > 0)?.[1].spot ?? 0;
    const total_oi = entries.reduce((sum, [, v]) => sum + v.call + v.put, 0);
    let minPayout = Infinity;
    let max_pain_strike = 0;
    for (const [K] of entries) {
      let payout = 0;
      for (const [S, v] of entries) {
        if (S > K) payout += (S - K) * v.call;  // in-the-money calls
        if (S < K) payout += (K - S) * v.put;   // in-the-money puts
      }
      if (payout < minPayout) { minPayout = payout; max_pain_strike = K; }
    }
    return { max_pain_strike, spot, total_oi };
  }

  try {
    const now = Date.now();
    const assets: MaxPainAsset[] = [];

    for (const currency of ["BTC", "ETH"] as const) {
      const res = await fetch(
        `https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=${currency}&kind=option`
      );
      if (!res.ok) continue;
      const json = (await res.json()) as DeribitResponse;
      const instruments = json.result ?? [];

      // Group by expiry -> strike -> {call OI, put OI, spot}
      const expiryMap = new Map<string, Map<number, { call: number; put: number; spot: number }>>();
      for (const inst of instruments) {
        const parts = inst.instrument_name.split("-");
        if (parts.length < 4) continue;
        const expiry = parts[1];
        const strike = parseInt(parts[2]);
        const optType = parts[3];
        if (isNaN(strike)) continue;
        if (!expiryMap.has(expiry)) expiryMap.set(expiry, new Map());
        const sm = expiryMap.get(expiry)!;
        if (!sm.has(strike)) sm.set(strike, { call: 0, put: 0, spot: 0 });
        const entry = sm.get(strike)!;
        if (optType === "C") entry.call += inst.open_interest;
        else if (optType === "P") entry.put += inst.open_interest;
        if (inst.underlying_price > 0) entry.spot = inst.underlying_price;
      }

      // Find the future expiry with the highest total OI
      let bestExpiry = "";
      let bestOI = 0;
      for (const [expiry, strikeData] of expiryMap.entries()) {
        const dt = parseExpiry(expiry);
        if (!dt || dt.getTime() <= now) continue;
        const totalOI = Array.from(strikeData.values()).reduce((s, v) => s + v.call + v.put, 0);
        if (totalOI > bestOI) { bestOI = totalOI; bestExpiry = expiry; }
      }
      if (!bestExpiry) continue;

      const strikeData = expiryMap.get(bestExpiry)!;
      const { max_pain_strike, spot, total_oi } = computeMaxPain(strikeData);
      if (spot === 0) continue;

      const distance_pct = parseFloat(((max_pain_strike - spot) / spot * 100).toFixed(1));
      const direction: MaxPainAsset["direction"] =
        distance_pct > 0.5 ? "above" : distance_pct < -0.5 ? "below" : "at";

      assets.push({ asset: currency, spot_usd: Math.round(spot), max_pain_strike, distance_pct, direction, expiry: bestExpiry, expiry_oi_contracts: Math.round(total_oi) });
    }

    if (assets.length > 0) {
      options_max_pain = { assets };
    }
  } catch {
    // Fall through with undefined options_max_pain
  }

  const result =
    options_max_pain && options_max_pain.assets.length > 0
      ? options_max_pain.assets
          .map((a) => `${a.asset} max pain $${a.max_pain_strike.toLocaleString()} (${a.distance_pct > 0 ? "+" : ""}${a.distance_pct}% vs spot)`)
          .join(" | ")
      : "Options max pain data temporarily unavailable";

  return { service_type: "options-max-pain", result, options_max_pain, timestamp, delivered_to };
}

/**
 * BTC Rainbow Chart — power-law model showing where BTC price sits relative to its
 * long-run log-linear trend (Giovani Santostasi formula).
 * Model: log10(price) = 5.84 × log10(days_since_genesis) − 17.01
 * Rainbow bands are defined as ratios of current price to model price.
 */
export async function deliverBtcRainbow(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  // Bitcoin genesis block: January 3, 2009
  const GENESIS = new Date("2009-01-03T00:00:00Z").getTime();
  const POWER_LAW_A = 5.84;
  const POWER_LAW_B = -17.01;

  // Rainbow bands: [minRatio, maxRatio, index, label, color]
  // ratio = current_price / model_price
  const BANDS: Array<[number, number, number, string, string]> = [
    [0,    0.20, 1, "Basically a Fire Sale",     "#1a237e"],
    [0.20, 0.40, 2, "BUY!",                       "#1565c0"],
    [0.40, 0.70, 3, "Accumulate",                 "#00838f"],
    [0.70, 1.10, 4, "Still Cheap",                "#2e7d32"],
    [1.10, 1.70, 5, "HODL!",                      "#f9a825"],
    [1.70, 3.00, 6, "Is This a Bubble?",          "#e65100"],
    [3.00, 5.50, 7, "FOMO Intensifies",           "#bf360c"],
    [5.50, 9.00, 8, "Sell. Seriously, SELL!",     "#b71c1c"],
    [9.00, Infinity, 9, "Maximum Bubble Territory", "#4a0000"],
  ];

  const INTERPRETATIONS: Record<number, string> = {
    1: "BTC is deeply below its long-run trend — historically rare buying opportunity.",
    2: "BTC is well below its power-law trajectory — strong accumulation zone.",
    3: "BTC is trading below trend — historically a good accumulation window.",
    4: "BTC is slightly below its power-law model — still relatively undervalued.",
    5: "BTC is near its long-run model price — fair value zone.",
    6: "BTC is above its power-law model — some froth is showing.",
    7: "BTC is well above trend — late cycle dynamics, exercise caution.",
    8: "BTC is significantly extended above the power-law model — historically a sell zone.",
    9: "BTC is in extreme bubble territory relative to the power-law model.",
  };

  let btc_rainbow: BtcRainbowData | undefined;

  try {
    // Fetch current BTC price from CoinGecko
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd";
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
    const data = await res.json() as { bitcoin?: { usd?: number } };
    const current_price_usd = data?.bitcoin?.usd;
    if (typeof current_price_usd !== "number" || current_price_usd <= 0) throw new Error("Invalid price");

    const now = Date.now();
    const days_since_genesis = Math.floor((now - GENESIS) / 86_400_000);
    const model_price_usd = Math.pow(10, POWER_LAW_A * Math.log10(days_since_genesis) + POWER_LAW_B);
    const ratio = parseFloat((current_price_usd / model_price_usd).toFixed(4));

    const entry = BANDS.find(([min, max]) => ratio >= min && ratio < max) ?? BANDS[BANDS.length - 1];
    const [, , index, label, color] = entry;
    const band: BtcRainbowBand = { index, label, color };
    const interpretation = INTERPRETATIONS[index] ?? "";

    btc_rainbow = { current_price_usd, model_price_usd: Math.round(model_price_usd), ratio, days_since_genesis, band, interpretation };
  } catch {
    // Fall through with undefined btc_rainbow
  }

  const result = btc_rainbow
    ? `BTC $${btc_rainbow.current_price_usd.toLocaleString()} · Model $${btc_rainbow.model_price_usd.toLocaleString()} · ${btc_rainbow.band.label} (${(btc_rainbow.ratio * 100).toFixed(0)}% of model)`
    : "BTC rainbow chart data temporarily unavailable";

  return { service_type: "btc-rainbow", result, btc_rainbow, timestamp, delivered_to };
}

// Known stablecoin IDs to exclude from altcoin season calculation
const STABLECOIN_IDS = new Set([
  "tether", "usd-coin", "dai", "frax", "true-usd", "pax-dollar", "usdd",
  "first-digital-usd", "usd-e", "ethena-usde", "paypal-usd", "fdusd",
  "tether-eurt", "stasis-eurs", "usd+", "mountain-protocol-usdm",
  "bridged-usdc-polygon-pos-bridge", "binance-peg-busd",
]);

export async function deliverAltcoinSeason(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let altcoin_season: AltcoinSeasonData | undefined;

  try {
    // Fetch top 100 coins by market cap with 30d price change (gives enough after filtering stables)
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&price_change_percentage=30d";
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
    interface CgCoin {
      id: string; symbol: string; name: string;
      price_change_percentage_30d_in_currency: number | null;
    }
    const coins = await res.json() as CgCoin[];

    // Find BTC 30d change
    const btcEntry = coins.find((c) => c.id === "bitcoin");
    const btcChange = btcEntry?.price_change_percentage_30d_in_currency ?? 0;

    // Filter: exclude BTC, stablecoins (by ID or near-zero 30d change), and nulls
    const alts: AltcoinSeasonCoin[] = [];
    for (const c of coins) {
      if (c.id === "bitcoin") continue;
      if (STABLECOIN_IDS.has(c.id)) continue;
      const ch = c.price_change_percentage_30d_in_currency;
      if (ch === null || ch === undefined) continue;
      // Heuristic: stablecoins have <±2% 30d change — skip anything suspiciously flat
      if (Math.abs(ch) < 2 && c.symbol.toLowerCase().includes("usd")) continue;
      alts.push({
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        change_30d_pct: parseFloat(ch.toFixed(2)),
        outperformed_btc: ch > btcChange,
      });
      if (alts.length >= 50) break; // cap at top 50 non-stable alts
    }

    const outperforming = alts.filter((a) => a.outperformed_btc).length;
    const total_coins = alts.length;
    const score = total_coins > 0 ? Math.round((outperforming / total_coins) * 100) : 0;

    const signal: AltcoinSeasonData["signal"] =
      score >= 75 ? "altcoin" : score <= 25 ? "bitcoin" : "neutral";
    const signal_label =
      signal === "altcoin" ? "Altcoin Season 🔥" :
      signal === "bitcoin" ? "Bitcoin Season 🟠" :
      "Mixed / Neutral ⚖️";

    // Sort to get top 5 and bottom 5 performers
    const sorted = [...alts].sort((a, b) => b.change_30d_pct - a.change_30d_pct);
    const top_performers = sorted.slice(0, 5);
    const bottom_performers = sorted.slice(-5).reverse();

    altcoin_season = {
      score,
      btc_change_30d_pct: parseFloat(btcChange.toFixed(2)),
      total_coins,
      outperforming,
      signal,
      signal_label,
      top_performers,
      bottom_performers,
    };
  } catch {
    // Fall through with undefined altcoin_season
  }

  const result = altcoin_season
    ? `${altcoin_season.signal_label} · Score ${altcoin_season.score}/100 · ${altcoin_season.outperforming}/${altcoin_season.total_coins} alts beat BTC (BTC 30d: ${altcoin_season.btc_change_30d_pct >= 0 ? "+" : ""}${altcoin_season.btc_change_30d_pct}%)`
    : "Altcoin season data temporarily unavailable";

  return { service_type: "altcoin-season", result, altcoin_season, timestamp, delivered_to };
}

export async function deliverBtcMining(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let btc_mining: BtcMiningData | undefined;

  try {
    // Fetch difficulty adjustment data and current hashrate in parallel
    const [adjRes, hrRes] = await Promise.all([
      fetch("https://mempool.space/api/v1/difficulty-adjustment", { signal: AbortSignal.timeout(10000) }),
      fetch("https://mempool.space/api/v1/mining/hashrate/3d", { signal: AbortSignal.timeout(10000) }),
    ]);
    if (!adjRes.ok) throw new Error(`mempool.space difficulty HTTP ${adjRes.status}`);
    if (!hrRes.ok) throw new Error(`mempool.space hashrate HTTP ${hrRes.status}`);

    const adj = await adjRes.json() as {
      progressPercent: number;
      difficultyChange: number;
      estimatedRetargetDate: number; // milliseconds
      remainingBlocks: number;
      remainingTime: number;         // milliseconds
      previousRetarget: number;
      nextRetargetHeight: number;
      timeAvg: number;               // milliseconds
    };
    const hr = await hrRes.json() as { currentHashrate: number };

    const hashrate_eh = parseFloat((hr.currentHashrate / 1e18).toFixed(1));
    const days_until_retarget = Math.max(0, Math.round(adj.remainingTime / (1000 * 86400)));
    const retargetDate = new Date(adj.estimatedRetargetDate);
    const avg_block_time_sec = Math.round(adj.timeAvg / 1000);

    btc_mining = {
      hashrate_eh,
      difficulty_change_pct: parseFloat(adj.difficultyChange.toFixed(2)),
      progress_pct: parseFloat(adj.progressPercent.toFixed(1)),
      remaining_blocks: adj.remainingBlocks,
      estimated_retarget_date: retargetDate.toISOString(),
      days_until_retarget,
      prev_retarget_pct: parseFloat(adj.previousRetarget.toFixed(2)),
      next_retarget_height: adj.nextRetargetHeight,
      avg_block_time_sec,
    };
  } catch {
    // Fall through with undefined btc_mining
  }

  const result = btc_mining
    ? `${btc_mining.hashrate_eh} EH/s · Next adjustment ${btc_mining.difficulty_change_pct >= 0 ? "+" : ""}${btc_mining.difficulty_change_pct}% in ${btc_mining.remaining_blocks} blocks (${btc_mining.days_until_retarget}d) · Avg block ${btc_mining.avg_block_time_sec}s`
    : "BTC mining data temporarily unavailable";

  return { service_type: "btc-mining", result, btc_mining, timestamp, delivered_to };
}

export async function deliverBridgeVolume(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let bridge_volume: BridgeVolumeData | undefined;

  try {
    const res = await fetch("https://bridges.llama.fi/bridges?includeChains=true", {
      headers: { "User-Agent": "skill-tokenized-agents/1.0" },
    });
    if (res.ok) {
      const data = await res.json();
      const rawBridges = (data.bridges ?? []) as Array<{
        displayName: string;
        last24hVolume: number;
        weeklyVolume: number;
        chains: string[];
      }>;

      // Sort by 24h volume descending, take top 10
      const sorted = rawBridges
        .filter((b) => b.last24hVolume > 0)
        .sort((a, b) => b.last24hVolume - a.last24hVolume)
        .slice(0, 10);

      const bridges: BridgeEntry[] = sorted.map((b) => ({
        name: b.displayName,
        volume_24h_usd: b.last24hVolume,
        volume_7d_usd: b.weeklyVolume,
        chains: b.chains.length,
      }));

      const total_24h_usd = rawBridges.reduce((s, b) => s + (b.last24hVolume ?? 0), 0);
      const total_7d_usd = rawBridges.reduce((s, b) => s + (b.weeklyVolume ?? 0), 0);

      bridge_volume = { bridges, total_24h_usd, total_7d_usd };
    }
  } catch {
    // Fall through with undefined bridge_volume
  }

  const result = bridge_volume
    ? `Top bridge: ${bridge_volume.bridges[0]?.name} $${(bridge_volume.bridges[0]?.volume_24h_usd / 1e6).toFixed(0)}M · Total 24h $${(bridge_volume.total_24h_usd / 1e9).toFixed(2)}B across ${bridge_volume.bridges.length} bridges`
    : "Bridge volume data temporarily unavailable";

  return { service_type: "bridge-volume", result, bridge_volume, timestamp, delivered_to };
}

/**
 * Fetches DeFi protocol TVL data from DeFi Llama and returns the biggest 7-day movers.
 * Shows top 5 gainers and top 5 losers by 7-day % TVL change, filtered to protocols
 * with TVL > $100M to exclude noise from small/inactive protocols.
 */
export async function deliverTvlMovers(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let tvl_movers: TvlMoversData | undefined;

  try {
    const res = await fetch("https://api.llama.fi/protocols", {
      headers: { Accept: "application/json", "User-Agent": "skill-tokenized-agents/1.0" },
      signal: AbortSignal.timeout(12000),
    });

    if (res.ok) {
      const data = (await res.json()) as Array<{
        name: string;
        symbol: string;
        tvl: number;
        change_7d: number;
        change_1d: number;
        chains: string[];
        category: string;
      }>;

      // Filter: meaningful TVL, valid 7d change data
      const eligible = data.filter(
        (p) => p.tvl > 100_000_000 && typeof p.change_7d === "number" && isFinite(p.change_7d),
      );

      const toEntry = (p: (typeof eligible)[number]): TvlMoverEntry => ({
        name: p.name,
        chain: (p.chains?.length === 1 ? p.chains[0] : null) ?? "Multi-chain",
        category: p.category ?? "DeFi",
        tvl_usd: p.tvl,
        change_7d_pct: parseFloat(p.change_7d.toFixed(2)),
      });

      const gainers = eligible
        .filter((p) => p.change_7d > 0)
        .sort((a, b) => b.change_7d - a.change_7d)
        .slice(0, 5)
        .map(toEntry);

      const losers = eligible
        .filter((p) => p.change_7d < 0)
        .sort((a, b) => a.change_7d - b.change_7d)
        .slice(0, 5)
        .map(toEntry);

      const total_defi_tvl = data.reduce((s, p) => s + (p.tvl ?? 0), 0);

      tvl_movers = { gainers, losers, total_defi_tvl };
    }
  } catch {
    // Fall through with undefined tvl_movers
  }

  const result = tvl_movers
    ? `Top gainer: ${tvl_movers.gainers[0]?.name} +${tvl_movers.gainers[0]?.change_7d_pct.toFixed(1)}% 7d · Biggest drop: ${tvl_movers.losers[0]?.name} ${tvl_movers.losers[0]?.change_7d_pct.toFixed(1)}% 7d · Total DeFi TVL $${(tvl_movers.total_defi_tvl / 1e9).toFixed(1)}B`
    : "TVL movers data temporarily unavailable";

  return { service_type: "tvl-movers", result, tvl_movers, timestamp, delivered_to };
}

/**
 * Fetches Bitcoin Lightning Network statistics from mempool.space.
 * Shows channel count, node count, total locked capacity, and week-over-week changes.
 */
export async function deliverLightningNetwork(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let lightning_network: LightningNetworkData | undefined;

  try {
    const res = await fetch("https://mempool.space/api/v1/lightning/statistics/latest", {
      headers: { Accept: "application/json", "User-Agent": "skill-tokenized-agents/1.0" },
      signal: AbortSignal.timeout(12000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        latest: {
          channel_count: number;
          node_count: number;
          total_capacity: number;
          avg_capacity: number;
          tor_nodes: number;
          avg_fee_rate: number;
        };
        previous: {
          channel_count: number;
          node_count: number;
          total_capacity: number;
        };
      };

      const l = data.latest;
      const p = data.previous;
      const SATS_PER_BTC = 100_000_000;

      lightning_network = {
        channel_count: l.channel_count,
        node_count: l.node_count,
        total_capacity_btc: parseFloat((l.total_capacity / SATS_PER_BTC).toFixed(2)),
        avg_channel_btc: parseFloat((l.avg_capacity / SATS_PER_BTC).toFixed(4)),
        tor_nodes: l.tor_nodes,
        avg_fee_rate: l.avg_fee_rate,
        channel_count_change: l.channel_count - p.channel_count,
        node_count_change: l.node_count - p.node_count,
        capacity_change_btc: parseFloat(((l.total_capacity - p.total_capacity) / SATS_PER_BTC).toFixed(2)),
      };
    }
  } catch {
    // Fall through with undefined lightning_network
  }

  const result = lightning_network
    ? `${lightning_network.channel_count.toLocaleString()} channels · ${lightning_network.node_count.toLocaleString()} nodes · ${lightning_network.total_capacity_btc.toFixed(0)} BTC locked · ${lightning_network.channel_count_change >= 0 ? "+" : ""}${lightning_network.channel_count_change} channels WoW`
    : "Lightning Network data temporarily unavailable";

  return { service_type: "lightning-network", result, lightning_network, timestamp, delivered_to };
}

/**
 * Computes realized volatility for BTC, ETH, and SOL using 30-day daily price data from CoinGecko.
 * Reports annualized 30d and 7d realized vol, and a regime signal (escalating/stable/cooling).
 */
export async function deliverRealizedVol(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let realized_vol: RealizedVolData | undefined;

  try {
    const COINS = [
      { id: "bitcoin", symbol: "BTC" },
      { id: "ethereum", symbol: "ETH" },
      { id: "solana", symbol: "SOL" },
    ];

    const results = await Promise.all(
      COINS.map(async (coin) => {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=30&interval=daily`,
          {
            headers: { Accept: "application/json", "User-Agent": "skill-tokenized-agents/1.0" },
            signal: AbortSignal.timeout(12000),
          }
        );
        if (!res.ok) return null;
        const data = (await res.json()) as { prices: [number, number][] };
        return { symbol: coin.symbol, prices: data.prices };
      })
    );

    const assets: VolatilityEntry[] = [];

    for (const asset of results) {
      if (!asset || asset.prices.length < 8) continue;
      const prices = asset.prices;
      // Daily log returns
      const logReturns = prices.slice(1).map((p, i) => Math.log(p[1] / prices[i][1]));
      const last30 = logReturns;
      const last7 = logReturns.slice(-7);
      // Annualized realized vol = sqrt(mean squared return * 365) * 100
      const vol30d = Math.sqrt((last30.reduce((s, r) => s + r * r, 0) / last30.length) * 365) * 100;
      const vol7d = Math.sqrt((last7.reduce((s, r) => s + r * r, 0) / last7.length) * 365) * 100;
      const regime: VolatilityEntry["regime"] =
        vol7d > vol30d * 1.1 ? "escalating" : vol7d < vol30d * 0.9 ? "cooling" : "stable";
      assets.push({
        symbol: asset.symbol,
        vol_30d_pct: parseFloat(vol30d.toFixed(1)),
        vol_7d_pct: parseFloat(vol7d.toFixed(1)),
        regime,
      });
    }

    if (assets.length > 0) {
      // Overall regime: escalating if majority escalating, cooling if majority cooling
      const escalatingCount = assets.filter((a) => a.regime === "escalating").length;
      const coolingCount = assets.filter((a) => a.regime === "cooling").length;
      const market_regime: RealizedVolData["market_regime"] =
        escalatingCount > coolingCount ? "escalating" : coolingCount > escalatingCount ? "cooling" : "stable";
      realized_vol = { assets, market_regime };
    }
  } catch {
    // Fall through with undefined realized_vol
  }

  const result = realized_vol
    ? `Regime: ${realized_vol.market_regime} · ` +
      realized_vol.assets
        .map((a) => `${a.symbol} 30d=${a.vol_30d_pct}% 7d=${a.vol_7d_pct}%`)
        .join(" · ")
    : "Realized volatility data temporarily unavailable";

  return { service_type: "realized-vol", result, realized_vol, timestamp, delivered_to };
}

/**
 * Fetches top EVM DeFi lending supply rates across Aave v3, Compound v3, Maple, and other
 * major lending protocols on Ethereum and L2s — via DeFi Llama yields API.
 */
export async function deliverLendingRates(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let lending_rates: LendingRatesData | undefined;

  const LENDING_PROTOCOLS = new Set([
    "aave-v3", "compound-v3", "morpho", "spark", "euler", "fluid", "maple",
    "aave-v2", "compoundv2",
  ]);

  try {
    const res = await fetch("https://yields.llama.fi/pools", {
      headers: { Accept: "application/json", "User-Agent": "skill-tokenized-agents/1.0" },
      signal: AbortSignal.timeout(12000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        data: Array<{
          chain: string;
          project: string;
          symbol: string;
          apyBase: number | null;
          tvlUsd: number;
          stablecoin?: boolean;
        }>;
      };

      const pools = data.data
        .filter(
          (p) =>
            LENDING_PROTOCOLS.has(p.project) &&
            (p.apyBase ?? 0) > 0.05 &&
            p.tvlUsd > 50_000_000
        )
        .sort((a, b) => (b.apyBase ?? 0) - (a.apyBase ?? 0))
        .slice(0, 10)
        .map((p) => ({
          protocol: p.project,
          chain: p.chain,
          symbol: p.symbol,
          supply_apy: parseFloat((p.apyBase ?? 0).toFixed(2)),
          tvl_usd: p.tvlUsd,
        }));

      // Best stablecoin rate
      const stablePools = data.data.filter(
        (p) =>
          LENDING_PROTOCOLS.has(p.project) &&
          (p.stablecoin === true ||
            ["USDC", "USDT", "DAI", "PYUSD", "RLUSD", "USDE", "SUSDE"].includes(p.symbol)) &&
          (p.apyBase ?? 0) > 0.05 &&
          p.tvlUsd > 50_000_000
      );
      stablePools.sort((a, b) => (b.apyBase ?? 0) - (a.apyBase ?? 0));

      // Best ETH rate
      const ethPools = data.data.filter(
        (p) =>
          LENDING_PROTOCOLS.has(p.project) &&
          ["WETH", "ETH"].includes(p.symbol) &&
          (p.apyBase ?? 0) > 0.05 &&
          p.tvlUsd > 50_000_000
      );
      ethPools.sort((a, b) => (b.apyBase ?? 0) - (a.apyBase ?? 0));

      if (pools.length > 0) {
        lending_rates = {
          pools,
          best_stable_apy: parseFloat((stablePools[0]?.apyBase ?? 0).toFixed(2)),
          best_stable_protocol: stablePools[0] ? `${stablePools[0].project} ${stablePools[0].symbol}` : "—",
          best_eth_apy: parseFloat((ethPools[0]?.apyBase ?? 0).toFixed(2)),
          best_eth_protocol: ethPools[0] ? `${ethPools[0].project} (${ethPools[0].chain})` : "—",
        };
      }
    }
  } catch {
    // Fall through with undefined lending_rates
  }

  const result = lending_rates
    ? `Best stable: ${lending_rates.best_stable_protocol} ${lending_rates.best_stable_apy.toFixed(2)}% · Best ETH: ${lending_rates.best_eth_protocol} ${lending_rates.best_eth_apy.toFixed(2)}% · Top: ` +
      lending_rates.pools
        .slice(0, 3)
        .map((p) => `${p.symbol} ${p.supply_apy.toFixed(2)}%`)
        .join(" · ")
    : "Lending rate data temporarily unavailable";

  return { service_type: "lending-rates", result, lending_rates, timestamp, delivered_to };
}

/**
 * Fetches DeFi protocol revenue rankings via DeFi Llama.
 * Revenue is the portion of fees that protocols keep for themselves (treasury/token holders),
 * distinct from total user fees. Shows which protocols are most profitable.
 */
export async function deliverProtocolRevenue(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let protocol_revenue: ProtocolRevenueData | undefined;

  try {
    const res = await fetch(
      "https://api.llama.fi/overview/fees?excludeTotalDataChartBreakdown=true&excludeTotalDataChart=true&dataType=dailyRevenue",
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

      const entries: ProtocolRevenueEntry[] = json.protocols
        .filter((p) => !(p.chains.length === 1 && p.chains[0] === "Off Chain"))
        .filter((p) => (p.total30d ?? 0) > 0)
        .sort((a, b) => (b.total30d ?? 0) - (a.total30d ?? 0))
        .slice(0, 10)
        .map((p) => ({
          name: p.displayName ?? p.name,
          category: p.category,
          revenue_30d: p.total30d ?? 0,
          revenue_24h: p.total24h ?? 0,
          change_1m: p.change_1m ?? null,
          chains: (p.chains ?? []).filter((c) => c !== "Off Chain").slice(0, 2),
        }));

      if (entries.length > 0) {
        protocol_revenue = { entries };
      }
    }
  } catch {
    // Fall through with undefined protocol_revenue
  }

  const fmtRev = (v: number) =>
    v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(2)}B` :
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;

  const result =
    protocol_revenue && protocol_revenue.entries.length > 0
      ? protocol_revenue.entries
          .slice(0, 3)
          .map((e) => `${e.name} ${fmtRev(e.revenue_30d)} 30d`)
          .join(" | ")
      : "Protocol revenue data temporarily unavailable";

  return { service_type: "protocol-revenue", result, protocol_revenue, timestamp, delivered_to };
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
  if (serviceType === "cex-volume") return deliverCexVolume(delivered_to, timestamp);
  if (serviceType === "options-oi") return deliverOptionsOI(delivered_to, timestamp);
  if (serviceType === "options-max-pain") return deliverOptionsMaxPain(delivered_to, timestamp);
  if (serviceType === "btc-rainbow") return deliverBtcRainbow(delivered_to, timestamp);
  if (serviceType === "altcoin-season") return deliverAltcoinSeason(delivered_to, timestamp);
  if (serviceType === "btc-mining") return deliverBtcMining(delivered_to, timestamp);
  if (serviceType === "bridge-volume") return deliverBridgeVolume(delivered_to, timestamp);
  if (serviceType === "tvl-movers") return deliverTvlMovers(delivered_to, timestamp);
  if (serviceType === "lightning-network") return deliverLightningNetwork(delivered_to, timestamp);
  if (serviceType === "eth-lst") return deliverEthLst(delivered_to, timestamp);
  if (serviceType === "realized-vol") return deliverRealizedVol(delivered_to, timestamp);
  if (serviceType === "lending-rates") return deliverLendingRates(delivered_to, timestamp);
  if (serviceType === "protocol-revenue") return deliverProtocolRevenue(delivered_to, timestamp);
  return deliverCryptoPrices(delivered_to, timestamp);
}
