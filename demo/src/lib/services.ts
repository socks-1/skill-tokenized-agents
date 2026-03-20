/**
 * Data-fetching functions shared between /api/preview (free) and /api/verify (post-payment).
 * All functions are read-only calls to public APIs — no auth required.
 */

export type ServiceType = "crypto-prices" | "solana-stats" | "defi-yields" | "fear-greed" | "solana-ecosystem" | "ai-models" | "trending-coins" | "top-gainers" | "dex-volume" | "pumpfun-tokens" | "pump-new" | "funding-rates" | "btc-mempool" | "stablecoins" | "sol-protocol-tvl" | "ai-agent-tokens" | "sol-revenue" | "eth-gas" | "global-market" | "l2-tvl" | "sol-lst" | "polymarket" | "narratives" | "defi-fees" | "cex-volume" | "options-oi" | "options-max-pain" | "btc-rainbow" | "altcoin-season" | "btc-mining" | "bridge-volume" | "tvl-movers" | "lightning-network" | "eth-lst" | "realized-vol" | "lending-rates" | "protocol-revenue" | "btc-onchain" | "nft-market" | "market-breadth" | "perp-oi" | "stablecoin-chains" | "stablecoin-pegs" | "mining-pools" | "rwa-tvl" | "crypto-funding" | "chain-fees" | "chain-tvl" | "defi-exploits" | "global-dex" | "futures-basis" | "dex-aggregators" | "meme-coins" | "cross-chain-gas" | "hl-top-pairs" | "eth-beacon" | "restaking-tvl" | "btc-halving" | "sol-validators" | "stable-yields" | "btc-treasury" | "eth-blob" | "eth-supply" | "dao-governance" | "crypto-correlation" | "chain-dev";

/** All valid service type strings — use this for runtime validation instead of duplicating the list. */
export const ALL_SERVICE_TYPES: ServiceType[] = ["crypto-prices", "solana-stats", "defi-yields", "fear-greed", "solana-ecosystem", "ai-models", "trending-coins", "top-gainers", "dex-volume", "pumpfun-tokens", "pump-new", "funding-rates", "btc-mempool", "stablecoins", "sol-protocol-tvl", "ai-agent-tokens", "sol-revenue", "eth-gas", "global-market", "l2-tvl", "sol-lst", "polymarket", "narratives", "defi-fees", "cex-volume", "options-oi", "options-max-pain", "btc-rainbow", "altcoin-season", "btc-mining", "bridge-volume", "tvl-movers", "lightning-network", "eth-lst", "realized-vol", "lending-rates", "protocol-revenue", "btc-onchain", "nft-market", "market-breadth", "perp-oi", "stablecoin-chains", "stablecoin-pegs", "mining-pools", "rwa-tvl", "crypto-funding", "chain-fees", "chain-tvl", "defi-exploits", "global-dex", "futures-basis", "dex-aggregators", "meme-coins", "cross-chain-gas", "hl-top-pairs", "eth-beacon", "restaking-tvl", "btc-halving", "sol-validators", "stable-yields", "btc-treasury", "eth-blob", "eth-supply", "dao-governance", "crypto-correlation", "chain-dev"];

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

export interface NftCollectionEntry {
  name: string;
  symbol: string;
  floor_price_usd: number;
  floor_price_eth: number;
  volume_24h_usd: number;
  volume_24h_eth: number;
  market_cap_usd: number;
  change_24h_pct: number;
  market_cap_rank: number;
}

export interface NftMarketData {
  collections: NftCollectionEntry[];
}

export interface MarketBreadthEntry {
  symbol: string;
  name: string;
  change_24h_pct: number;
}

export interface MarketBreadthData {
  advancing: number;
  declining: number;
  neutral: number;
  total: number;
  breadth_score: number; // 0-100, % advancing
  top_gainers: MarketBreadthEntry[];
  top_losers: MarketBreadthEntry[];
}

export interface PerpExchangeEntry {
  name: string;
  oi_btc: number;
  oi_usd: number;
  vol_24h_btc: number;
  vol_24h_usd: number;
  perp_pairs: number;
}

export interface PerpOIData {
  exchanges: PerpExchangeEntry[];
  btc_price: number;
  total_oi_btc: number;
  total_oi_usd: number;
}

export interface StablecoinChainEntry {
  name: string;
  tvl_usd: number;
  pct_of_total: number;
}

export interface StablecoinChainsData {
  chains: StablecoinChainEntry[];
  total_usd: number;
  top_chain: string;
  top_chain_pct: number;
}

export interface StablecoinPegEntry {
  symbol: string;
  name: string;
  price: number;
  dev_pct: number;          // deviation from $1 peg in percent
  circ_usd: number;         // circulating supply in USD
  peg_status: "on-peg" | "warning" | "depegged";  // on-peg: ±0.1%, warning: ±0.5%, depegged: beyond
  peg_mechanism: string;    // "fiat-backed" | "crypto-backed" | "algorithmic"
}

export interface StablecoinPegsData {
  stablecoins: StablecoinPegEntry[];
  on_peg_count: number;
  warning_count: number;
  depegged_count: number;
  total_supply_usd: number;
}

export interface MiningPoolEntry {
  name: string;
  slug: string;
  block_count: number;
  share_pct: number;
  rank: number;
}

export interface MiningPoolsData {
  pools: MiningPoolEntry[];
  total_blocks_3d: number;
  hashrate_eh: number;
  nakamoto_coefficient: number;
  top3_concentration_pct: number;
  window: string;
}

export interface RwaProtocolEntry {
  name: string;
  slug: string;
  tvl_usd: number;
  change_1d_pct: number | null;
  change_7d_pct: number | null;
  chains: string[];
}

export interface RwaTvlData {
  protocols: RwaProtocolEntry[];
  total_tvl_usd: number;
  protocol_count: number;
  top_chain: string;
  week_change_pct: number | null;
}

export interface FundingRoundEntry {
  name: string;
  date_ts: number;           // Unix timestamp
  round: string;             // Seed, Series A, etc.
  amount_usd_m: number;      // amount in millions USD
  category: string;          // DeFi, CEX, Infrastructure, AI, etc.
  lead_investors: string[];  // lead investor names
}

export interface CryptoFundingData {
  rounds: FundingRoundEntry[];
  total_raised_usd_m: number;
  top_category: string;
  period_days: number;       // how many days back
  round_count: number;
}

export interface ChainFeeEntry {
  chain: string;
  fees_24h: number;          // USD
  change_1d_pct: number | null;
}

export interface ChainFeesData {
  chains: ChainFeeEntry[];   // sorted by fees_24h descending
  total_24h: number;         // sum of all tracked chains
  top_chain: string;         // highest-fee chain
}

export interface ChainTvlEntry {
  name: string;
  tvl: number;               // USD
  share_pct: number;         // % of total tracked TVL
}

export interface ChainTvlData {
  chains: ChainTvlEntry[];   // top chains sorted by TVL descending
  total_tvl: number;         // sum of all tracked chains USD
  eth_dominance_pct: number; // Ethereum's share of total
  top_chain: string;         // highest-TVL chain name
}

export interface DefiExploitEntry {
  name: string;
  date: number;          // Unix timestamp
  amount: number;        // USD amount stolen
  chain: string[];       // chains affected
  classification: string; // e.g. "Protocol Logic", "Rug Pull", "Access Control"
  technique: string;
}

export interface DefiExploitsData {
  incidents: DefiExploitEntry[]; // recent incidents sorted by amount descending
  total_stolen_usd: number;
  incident_count: number;
  most_targeted_chain: string;
  period_days: number;
}

export interface GlobalDexEntry {
  name: string;
  chains: string[];       // chains the DEX operates on
  volume_24h: number;     // USD 24h volume
  change_pct: number;     // 24h volume change %
}

export interface GlobalDexData {
  dexes: GlobalDexEntry[];
  total_volume_24h: number;
}

export interface FuturesBasisEntry {
  instrument: string;           // "BTC-26JUN26"
  expiry_label: string;         // "Jun 26" or "Perp"
  days_to_expiry: number;       // 0 for perpetual
  mark_price: number;
  spot_price: number;
  basis_usd: number;            // mark_price - spot_price
  basis_pct: number;            // (basis_usd / spot_price) * 100
  annualized_basis_pct: number | null; // null for perp or < 3 days to expiry
}

export interface FuturesBasisData {
  btc: FuturesBasisEntry[];
  eth: FuturesBasisEntry[];
  btc_spot: number;
  eth_spot: number;
}

export interface DexAggregatorEntry {
  name: string;
  chains: string[];       // top 3 chains the aggregator operates on
  volume_24h: number;     // USD 24h routed volume
  volume_7d: number;      // USD 7d routed volume
  change_pct: number | null; // 24h volume change %
}

export interface DexAggregatorsData {
  aggregators: DexAggregatorEntry[];
  total_volume_24h: number;
  total_volume_7d: number;
}

export interface MemeCoinEntry {
  name: string;
  symbol: string;
  price_usd: number;
  change_24h_pct: number | null;
  market_cap_usd: number;
  volume_24h_usd: number;
}

export interface MemeCoinsData {
  coins: MemeCoinEntry[];
  total_market_cap_usd: number;
  top_gainer: string;       // symbol of top 24h gainer
  top_loser: string;        // symbol of top 24h loser
}

export interface StableYieldEntry {
  protocol: string;     // e.g. "Aave V3"
  chain: string;        // e.g. "Ethereum"
  symbol: string;       // stablecoin symbol, e.g. "USDC"
  apy_pct: number;      // annualized yield %
  tvl_usd: number;      // pool TVL in USD
}

export interface StableYieldsData {
  pools: StableYieldEntry[];        // top pools sorted by APY
  avg_stablecoin_apy: number;       // average APY across all shown pools
  highest_protocol: string;         // name of highest-yield pool's protocol
  highest_apy: number;              // highest individual APY
  total_shown_tvl: number;          // sum of TVL across shown pools
}

export interface BtcTreasuryCompany {
  name: string;           // e.g. "Strategy"
  symbol: string;         // e.g. "MSTR.US"
  country: string;        // e.g. "US"
  total_btc: number;      // BTC held
  value_usd: number;      // current USD value
  pct_of_supply: number;  // % of total BTC supply (21M)
}

export interface BtcTreasuryData {
  total_holdings: number;          // total BTC held by all public companies
  total_value_usd: number;         // USD value of all holdings
  market_cap_dominance: number;    // % of total crypto market cap
  company_count: number;           // number of companies holding BTC
  top_companies: BtcTreasuryCompany[];  // top 10 by BTC held
  top_holder: string;              // name of #1 holder
  top_holder_btc: number;          // BTC held by #1
  top_holder_pct: number;          // % of all corporate holdings held by #1
}

export interface EthBlobData {
  blob_base_fee_gwei: number;      // current blob base fee in gwei
  blobs_in_latest: number;         // number of blobs in latest block (0-6)
  max_blobs_per_block: number;     // 6 (EIP-4844 maximum)
  target_blobs_per_block: number;  // 3 (EIP-4844 target)
  utilization_pct: number;         // blobs_in_latest / max * 100
  block_number: number;            // latest block number
  fee_tier: string;                // "Cheap" | "Moderate" | "Expensive"
  blob_cost_eth: number;           // cost in ETH to submit one blob (131072 bytes)
}

export interface EthSupplyData {
  burn_per_hour: number;              // ETH burned per hour via EIP-1559 base fee
  issuance_per_hour: number;          // ETH issued to validators per hour (~1700 ETH/day)
  net_per_hour: number;               // burn - issuance (positive = deflationary)
  is_deflationary: boolean;           // true when burn > issuance
  base_fee_gwei: number;              // current base fee in gwei (avg over sampled blocks)
  deflation_threshold_gwei: number;   // base fee needed for ETH to be deflationary
  blocks_sampled: number;             // number of blocks used in calculation
  supply_change_pct_annual: number;   // annualized net supply change %
}

export interface DaoProposal {
  id: string;
  title: string;
  dao_name: string;
  dao_id: string;
  state: "active" | "closed" | "pending";
  votes: number;
  end_timestamp: number;           // unix seconds
}

export interface DaoGovernanceData {
  proposals: DaoProposal[];
  active_count: number;
  closed_count: number;
}

export interface CorrelationEntry {
  symbol: string;
  correlation_30d: number;    // Pearson r, -1 to 1
  strength: "high" | "moderate" | "low" | "negative";
}

export interface CryptoCorrelationData {
  assets: CorrelationEntry[];    // sorted descending by correlation
  btc_price_usd: number;
  period_days: number;
}

export interface ChainDevEntry {
  chain: string;           // display name e.g. "Ethereum"
  repo: string;            // GitHub "{owner}/{repo}"
  commits_4w: number;      // commits in last 4 weeks
  commits_13w: number;     // commits in last 13 weeks
  trend_pct: number;       // % change vs prior 4-week window (positive = more active)
  activity_level: "high" | "moderate" | "low";
}

export interface ChainDevData {
  chains: ChainDevEntry[];   // sorted by commits_4w descending
  fetched_at: string;        // ISO timestamp
  period_note: string;       // e.g. "Last 4 weeks vs prior 4 weeks"
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
  btc_onchain?: BtcOnchainData;
  nft_market?: NftMarketData;
  market_breadth?: MarketBreadthData;
  perp_oi?: PerpOIData;
  stablecoin_chains?: StablecoinChainsData;
  stablecoin_pegs?: StablecoinPegsData;
  mining_pools?: MiningPoolsData;
  rwa_tvl?: RwaTvlData;
  crypto_funding?: CryptoFundingData;
  chain_fees?: ChainFeesData;
  chain_tvl?: ChainTvlData;
  defi_exploits?: DefiExploitsData;
  global_dex?: GlobalDexData;
  futures_basis?: FuturesBasisData;
  dex_aggregators?: DexAggregatorsData;
  meme_coins?: MemeCoinsData;
  cross_chain_gas?: CrossChainGasData;
  hl_top_pairs?: HlTopPairsData;
  eth_beacon?: EthBeaconData;
  restaking_tvl?: RestakingData;
  btc_halving?: BtcHalvingData;
  sol_validators?: SolValidatorsData;
  stable_yields?: StableYieldsData;
  btc_treasury?: BtcTreasuryData;
  eth_blob?: EthBlobData;
  eth_supply?: EthSupplyData;
  dao_governance?: DaoGovernanceData;
  crypto_correlation?: CryptoCorrelationData;
  chain_dev?: ChainDevData;
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

export interface BtcOnchainData {
  tx_count_24h: number;        // confirmed transactions in past 24h
  tx_volume_usd: number;       // estimated USD value transferred 24h
  tx_volume_btc: number;       // estimated BTC transferred 24h
  blocks_mined_24h: number;    // blocks mined in past 24h (≈144 target)
  subsidy_revenue_usd: number; // block subsidy revenue 24h (blocks × 3.125 BTC × price)
  avg_tx_value_usd: number;    // average transaction value in USD
}

export interface CrossChainGasEntry {
  chain: string;           // "Ethereum L1" | "Base" | "Arbitrum" | "Optimism" | "BNB Chain" | "Solana"
  symbol: string;          // native token symbol (ETH, BNB, SOL)
  gas_price_gwei: number | null;  // null for Solana (uses lamports)
  transfer_cost_usd: number;      // simple transfer cost in USD
  relative_pct: number;           // cost relative to Ethereum L1 (ETH L1 = 100%)
}

export interface CrossChainGasData {
  chains: CrossChainGasEntry[];  // sorted cheapest first
  cheapest: string;              // name of cheapest chain
  eth_base_fee_gwei: number;     // current ETH L1 gas price in gwei
}

export interface HlPairEntry {
  symbol: string;              // asset symbol e.g. "BTC", "HYPE"
  volume_24h_usd: number;      // 24h notional volume in USD
  mark_price: number;          // current mark price USD
  price_change_pct: number;    // 24h price change %
  open_interest_usd: number;   // open interest in USD
  funding_rate: number;        // hourly funding rate (raw, e.g. -0.0000089)
}

export interface HlTopPairsData {
  pairs: HlPairEntry[];          // top 10 by 24h volume
  total_volume_24h_usd: number;  // sum of all Hyperliquid 24h volume
  top_pair: string;              // symbol with highest volume
}

export interface EthBeaconData {
  // Consensus Layer (beaconchain)
  epoch: number;
  slot: number;
  slot_in_epoch: number;         // 0-31, where we are in the current epoch
  finalized_epoch: number;
  finality_lag: number;          // head epoch - finalized epoch (healthy = 2)
  is_finalizing: boolean;        // finality_lag <= 3
  // Execution Layer
  block_number: number;
  base_fee_gwei: number;
  gas_util_pct: number;          // gas used / gas limit * 100
}

export interface RestakingProtocolEntry {
  name: string;
  tvl: number;             // USD
  change_1d_pct: number | null;
  change_7d_pct: number | null;
  chains: string[];        // top chains (up to 3)
  category: string;        // e.g. "Restaking", "Liquid Restaking"
}

export interface RestakingData {
  protocols: RestakingProtocolEntry[];  // sorted by TVL descending
  total_tvl: number;                    // total restaking TVL in USD
  top_protocol: string;                 // name of largest protocol
  dominant_pct: number;                 // top protocol % of total TVL
}

export interface BtcHalvingEntry {
  number: number;             // halving number (1, 2, 3, 4…)
  block_height: number;       // block height at which halving occurred
  date_approx: string;        // approximate date e.g. "Apr 2024"
  reward_before_btc: number;  // block reward before halving
  reward_after_btc: number;   // block reward after halving
}

export interface BtcHalvingData {
  current_height: number;       // latest Bitcoin block height
  next_halving_height: number;  // block height of next halving
  blocks_remaining: number;     // blocks until next halving
  epoch_progress_pct: number;   // % progress through current halving epoch
  current_reward_btc: number;   // current block reward in BTC
  next_reward_btc: number;      // block reward after next halving
  estimated_days: number;       // estimated days until next halving
  estimated_date: string;       // human-readable estimated date
  avg_block_time_secs: number;  // current avg block time in seconds
  supply_mined_pct: number;     // % of 21M BTC cap already mined
  halvings: BtcHalvingEntry[];  // historical halvings
}

export interface SolValidatorEntry {
  rank: number;
  vote_pubkey: string;       // full vote account pubkey
  node_pubkey_short: string; // truncated node identity e.g. "AbCd...wxYZ"
  activated_stake_sol: number; // stake in SOL
  stake_pct: number;         // % of total network stake
  commission: number;        // validator commission %
  last_vote: number;         // slot of last vote
  status: "active" | "delinquent";
}

export interface SolValidatorsData {
  validators: SolValidatorEntry[]; // top 10 by stake
  total_stake_sol: number;         // total network stake in SOL
  total_validators: number;        // total active validators
  delinquent_count: number;        // delinquent validator count
  avg_commission: number;          // avg commission of top 10
  slot_height: number;             // approximate current slot
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
  if (serviceType === "btc-onchain") return deliverBtcOnchain(delivered_to, timestamp);
  if (serviceType === "nft-market") return deliverNftMarket(delivered_to, timestamp);
  if (serviceType === "market-breadth") return deliverMarketBreadth(delivered_to, timestamp);
  if (serviceType === "perp-oi") return deliverPerpOI(delivered_to, timestamp);
  if (serviceType === "stablecoin-chains") return deliverStablecoinChains(delivered_to, timestamp);
  if (serviceType === "stablecoin-pegs") return deliverStablecoinPegs(delivered_to, timestamp);
  if (serviceType === "mining-pools") return deliverMiningPools(delivered_to, timestamp);
  if (serviceType === "rwa-tvl") return deliverRwaTvl(delivered_to, timestamp);
  if (serviceType === "crypto-funding") return deliverCryptoFunding(delivered_to, timestamp);
  if (serviceType === "chain-fees") return deliverChainFees(delivered_to, timestamp);
  if (serviceType === "chain-tvl") return deliverChainTvl(delivered_to, timestamp);
  if (serviceType === "defi-exploits") return deliverDefiExploits(delivered_to, timestamp);
  if (serviceType === "global-dex") return deliverGlobalDex(delivered_to, timestamp);
  if (serviceType === "futures-basis") return deliverFuturesBasis(delivered_to, timestamp);
  if (serviceType === "dex-aggregators") return deliverDexAggregators(delivered_to, timestamp);
  if (serviceType === "meme-coins") return deliverMemeCoins(delivered_to, timestamp);
  if (serviceType === "cross-chain-gas") return deliverCrossChainGas(delivered_to, timestamp);
  if (serviceType === "hl-top-pairs") return deliverHlTopPairs(delivered_to, timestamp);
  if (serviceType === "eth-beacon") return deliverEthBeacon(delivered_to, timestamp);
  if (serviceType === "restaking-tvl") return deliverRestakingTvl(delivered_to, timestamp);
  if (serviceType === "btc-halving") return deliverBtcHalving(delivered_to, timestamp);
  if (serviceType === "sol-validators") return deliverSolValidators(delivered_to, timestamp);
  if (serviceType === "stable-yields") return deliverStableYields(delivered_to, timestamp);
  if (serviceType === "btc-treasury") return deliverBtcTreasury(delivered_to, timestamp);
  if (serviceType === "eth-blob") return deliverEthBlob(delivered_to, timestamp);
  if (serviceType === "eth-supply") return deliverEthSupply(delivered_to, timestamp);
  if (serviceType === "dao-governance") return deliverDaoGovernance(delivered_to, timestamp);
  if (serviceType === "crypto-correlation") return deliverCryptoCorrelation(delivered_to, timestamp);
  if (serviceType === "chain-dev") return deliverChainDev(delivered_to, timestamp);
  return deliverCryptoPrices(delivered_to, timestamp);
}

export async function deliverBtcOnchain(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let btc_onchain: BtcOnchainData | undefined;

  try {
    const res = await fetch("https://blockchain.info/stats?format=json", {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "skill-tokenized-agents/1.0" },
    });
    if (!res.ok) throw new Error(`blockchain.info HTTP ${res.status}`);

    const data = await res.json() as {
      n_tx: number;
      estimated_transaction_volume_usd: number;
      estimated_btc_sent: number;  // in satoshis
      n_blocks_mined: number;
      market_price_usd: number;
    };

    const tx_count_24h = data.n_tx ?? 0;
    const tx_volume_usd = data.estimated_transaction_volume_usd ?? 0;
    const tx_volume_btc = parseFloat(((data.estimated_btc_sent ?? 0) / 1e8).toFixed(0));
    const blocks_mined_24h = data.n_blocks_mined ?? 0;
    const btc_price = data.market_price_usd ?? 0;
    // Block subsidy post-April 2024 halving = 3.125 BTC/block
    const subsidy_revenue_usd = Math.round(blocks_mined_24h * 3.125 * btc_price);
    const avg_tx_value_usd = tx_count_24h > 0 ? Math.round(tx_volume_usd / tx_count_24h) : 0;

    if (tx_count_24h > 0) {
      btc_onchain = {
        tx_count_24h,
        tx_volume_usd,
        tx_volume_btc,
        blocks_mined_24h,
        subsidy_revenue_usd,
        avg_tx_value_usd,
      };
    }
  } catch {
    // Fall through with undefined btc_onchain
  }

  const fmtUsd = (v: number) =>
    v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toLocaleString()}`;

  const result = btc_onchain
    ? `${btc_onchain.tx_count_24h.toLocaleString()} txs · ${fmtUsd(btc_onchain.tx_volume_usd)} transferred · ${btc_onchain.blocks_mined_24h} blocks mined · subsidy revenue ${fmtUsd(btc_onchain.subsidy_revenue_usd)}`
    : "BTC on-chain data temporarily unavailable";

  return { service_type: "btc-onchain", result, btc_onchain, timestamp, delivered_to };
}

/**
 * Fetches NFT market snapshot for top blue-chip collections via CoinGecko free API.
 * Covers Ethereum-native NFTs (Pudgy Penguins, BAYC, CryptoPunks, Azuki, Milady, MAYC).
 * Shows floor price in ETH and USD, 24h volume, and 24h price change.
 */
export async function deliverNftMarket(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  const NFT_IDS = [
    { id: "pudgy-penguins", symbol: "PPG" },
    { id: "bored-ape-yacht-club", symbol: "BAYC" },
    { id: "cryptopunks", symbol: "PUNK" },
    { id: "azuki", symbol: "AZUKI" },
    { id: "milady", symbol: "MILADY" },
    { id: "mutant-ape-yacht-club", symbol: "MAYC" },
  ];

  let nft_market: NftMarketData | undefined;

  try {
    const results = await Promise.allSettled(
      NFT_IDS.map(({ id }) =>
        fetch(`https://api.coingecko.com/api/v3/nfts/${id}`, {
          signal: AbortSignal.timeout(10000),
          headers: { "User-Agent": "skill-tokenized-agents/1.0", Accept: "application/json" },
        }).then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<{
            name: string;
            market_cap_rank: number;
            floor_price: { native_currency: number; usd: number };
            market_cap: { native_currency: number; usd: number };
            volume_24h: { native_currency: number; usd: number };
            floor_price_in_usd_24h_percentage_change: number;
          }>;
        })
      )
    );

    const collections: NftCollectionEntry[] = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") {
        const d = r.value;
        const sym = NFT_IDS[i].symbol;
        collections.push({
          name: d.name,
          symbol: sym,
          floor_price_usd: d.floor_price?.usd ?? 0,
          floor_price_eth: d.floor_price?.native_currency ?? 0,
          volume_24h_usd: d.volume_24h?.usd ?? 0,
          volume_24h_eth: d.volume_24h?.native_currency ?? 0,
          market_cap_usd: d.market_cap?.usd ?? 0,
          change_24h_pct: d.floor_price_in_usd_24h_percentage_change ?? 0,
          market_cap_rank: d.market_cap_rank ?? 999,
        });
      }
    });

    // Sort by 24h volume descending
    collections.sort((a, b) => b.volume_24h_usd - a.volume_24h_usd);

    if (collections.length > 0) {
      nft_market = { collections };
    }
  } catch {
    // Fall through with undefined nft_market
  }

  const fmtUsd = (v: number) =>
    v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(1)}K` : `$${v.toLocaleString()}`;

  const result = nft_market && nft_market.collections.length > 0
    ? nft_market.collections
        .slice(0, 3)
        .map((c) => `${c.symbol} floor ${fmtUsd(c.floor_price_usd)} (${c.change_24h_pct >= 0 ? "+" : ""}${c.change_24h_pct.toFixed(1)}%)`)
        .join(" · ")
    : "NFT market data temporarily unavailable";

  return { service_type: "nft-market", result, nft_market, timestamp, delivered_to };
}

export async function deliverMarketBreadth(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let market_breadth: MarketBreadthData | undefined;

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1",
      {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "skill-tokenized-agents/1.0", Accept: "application/json" },
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const coins = await res.json() as Array<{
      symbol: string;
      name: string;
      price_change_percentage_24h: number | null;
    }>;

    const entries: MarketBreadthEntry[] = coins
      .filter((c) => c.price_change_percentage_24h != null)
      .map((c) => ({
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        change_24h_pct: c.price_change_percentage_24h!,
      }));

    const advancing = entries.filter((e) => e.change_24h_pct > 0.5).length;
    const declining = entries.filter((e) => e.change_24h_pct < -0.5).length;
    const neutral = entries.length - advancing - declining;
    const breadth_score = Math.round((advancing / entries.length) * 100);

    const sorted = [...entries].sort((a, b) => b.change_24h_pct - a.change_24h_pct);
    const top_gainers = sorted.slice(0, 5);
    const top_losers = sorted.slice(-5).reverse();

    market_breadth = { advancing, declining, neutral, total: entries.length, breadth_score, top_gainers, top_losers };
  } catch {
    // Fall through with undefined market_breadth
  }

  const result = market_breadth
    ? `${market_breadth.advancing}/${market_breadth.total} advancing (${market_breadth.breadth_score}% breadth) · top: ${market_breadth.top_gainers[0]?.symbol} +${market_breadth.top_gainers[0]?.change_24h_pct.toFixed(1)}% · worst: ${market_breadth.top_losers[0]?.symbol} ${market_breadth.top_losers[0]?.change_24h_pct.toFixed(1)}%`
    : "Market breadth data temporarily unavailable";

  return { service_type: "market-breadth", result, market_breadth, timestamp, delivered_to };
}

/**
 * Fetches top crypto derivatives exchanges ranked by open interest via CoinGecko free API.
 * Shows BTC-equivalent OI converted to USD, 24h trading volume, and perpetual pair count.
 * Covers major venues: Binance, Bybit, OKX, Gate, Hyperliquid, Bitget, MEXC, and more.
 */
export async function deliverPerpOI(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let perp_oi: PerpOIData | undefined;

  try {
    const [priceRes, exchRes] = await Promise.all([
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd", {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "skill-tokenized-agents/1.0", Accept: "application/json" },
      }),
      fetch("https://api.coingecko.com/api/v3/derivatives/exchanges?order=open_interest_btc_desc&per_page=15&page=1", {
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "skill-tokenized-agents/1.0", Accept: "application/json" },
      }),
    ]);

    if (!priceRes.ok) throw new Error(`price HTTP ${priceRes.status}`);
    if (!exchRes.ok) throw new Error(`exchanges HTTP ${exchRes.status}`);

    const priceData = await priceRes.json() as { bitcoin: { usd: number } };
    const btc_price = priceData.bitcoin?.usd ?? 0;

    const rawExchanges = await exchRes.json() as Array<{
      name: string;
      open_interest_btc: number | null;
      trade_volume_24h_btc: number | null;
      number_of_perpetual_pairs: number | null;
    }>;

    const entries: PerpExchangeEntry[] = rawExchanges
      .filter((e) => e.open_interest_btc != null && Number(e.open_interest_btc) > 0)
      .slice(0, 10)
      .map((e) => {
        const oi_btc = Number(e.open_interest_btc ?? 0);
        const vol_btc = Number(e.trade_volume_24h_btc ?? 0);
        return {
          name: e.name,
          oi_btc: Math.round(oi_btc),
          oi_usd: Math.round(oi_btc * btc_price),
          vol_24h_btc: Math.round(vol_btc),
          vol_24h_usd: Math.round(vol_btc * btc_price),
          perp_pairs: e.number_of_perpetual_pairs ?? 0,
        };
      });

    if (entries.length > 0 && btc_price > 0) {
      const total_oi_btc = entries.reduce((s, e) => s + e.oi_btc, 0);
      const total_oi_usd = Math.round(total_oi_btc * btc_price);
      perp_oi = { exchanges: entries, btc_price, total_oi_btc, total_oi_usd };
    }
  } catch {
    // Fall through with undefined perp_oi
  }

  const fmtUsd = (v: number) =>
    v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toLocaleString()}`;

  const result = perp_oi && perp_oi.exchanges.length > 0
    ? `${perp_oi.exchanges[0].name} ${fmtUsd(perp_oi.exchanges[0].oi_usd)} OI · ${perp_oi.exchanges[1]?.name ?? ""} ${fmtUsd(perp_oi.exchanges[1]?.oi_usd ?? 0)} · top-10 total ${fmtUsd(perp_oi.total_oi_usd)}`
    : "Perp exchange OI data temporarily unavailable";

  return { service_type: "perp-oi", result, perp_oi, timestamp, delivered_to };
}

/**
 * Fetches stablecoin TVL distribution across blockchains via DeFi Llama.
 * Shows which chains hold the most stablecoin liquidity (ETH, TRON, Solana, etc.).
 */
export async function deliverStablecoinChains(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let stablecoin_chains: StablecoinChainsData | undefined;

  try {
    const res = await fetch("https://stablecoins.llama.fi/stablecoinchains", {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "skill-tokenized-agents/1.0", Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json() as Array<{
      name: string;
      totalCirculatingUSD: { peggedUSD?: number };
    }>;

    const sorted = raw
      .map((c) => ({ name: c.name, tvl_usd: c.totalCirculatingUSD?.peggedUSD ?? 0 }))
      .filter((c) => c.tvl_usd > 1e6)
      .sort((a, b) => b.tvl_usd - a.tvl_usd)
      .slice(0, 12);

    if (sorted.length > 0) {
      const total_usd = sorted.reduce((s, c) => s + c.tvl_usd, 0);
      const chains: StablecoinChainEntry[] = sorted.map((c) => ({
        name: c.name,
        tvl_usd: Math.round(c.tvl_usd),
        pct_of_total: Math.round((c.tvl_usd / total_usd) * 1000) / 10,
      }));
      stablecoin_chains = {
        chains,
        total_usd: Math.round(total_usd),
        top_chain: chains[0].name,
        top_chain_pct: chains[0].pct_of_total,
      };
    }
  } catch {
    // Fall through with undefined stablecoin_chains
  }

  const fmtUsd = (v: number) =>
    v >= 1e12 ? `$${(v / 1e12).toFixed(2)}T` :
    v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` :
    v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toLocaleString()}`;

  const result = stablecoin_chains && stablecoin_chains.chains.length > 0
    ? `${stablecoin_chains.top_chain} ${fmtUsd(stablecoin_chains.chains[0].tvl_usd)} (${stablecoin_chains.top_chain_pct}%) · top-12 total ${fmtUsd(stablecoin_chains.total_usd)}`
    : "Stablecoin chain distribution data temporarily unavailable";

  return { service_type: "stablecoin-chains", result, stablecoin_chains, timestamp, delivered_to };
}

/**
 * Fetches stablecoin peg health for top USD-pegged stablecoins via DeFi Llama.
 * Shows price deviation from $1, circulating supply, and depeg status.
 * Yield-bearing stablecoins (price > 1.05) are excluded as they accrue value by design.
 */
export async function deliverStablecoinPegs(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let stablecoin_pegs: StablecoinPegsData | undefined;

  try {
    const res = await fetch("https://stablecoins.llama.fi/stablecoins?includePrices=true", {
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "skill-tokenized-agents/1.0", Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json() as {
      peggedAssets: Array<{
        symbol: string;
        name: string;
        price: number | null;
        pegType: string;
        pegMechanism: string;
        circulating: { peggedUSD?: number };
      }>;
    };

    // Filter: USD-pegged, has price, large enough supply ($500M+), price within traditional range (not yield-bearing)
    const filtered = data.peggedAssets
      .filter((p) =>
        p.pegType === "peggedUSD" &&
        p.price != null &&
        p.price > 0.85 && p.price < 1.05 &&   // exclude yield-bearing (e.g. USYC at 1.12)
        (p.circulating?.peggedUSD ?? 0) >= 5e8  // $500M+ circulating
      )
      .sort((a, b) => (b.circulating?.peggedUSD ?? 0) - (a.circulating?.peggedUSD ?? 0))
      .slice(0, 15);

    if (filtered.length > 0) {
      const pegStatus = (dev: number): "on-peg" | "warning" | "depegged" => {
        const abs = Math.abs(dev);
        if (abs <= 0.1) return "on-peg";
        if (abs <= 0.5) return "warning";
        return "depegged";
      };

      const mechLabel = (m: string) => {
        if (m?.includes("fiat")) return "fiat-backed";
        if (m?.includes("crypto")) return "crypto-backed";
        if (m?.includes("algo")) return "algorithmic";
        return m ?? "unknown";
      };

      const stablecoins: StablecoinPegEntry[] = filtered.map((p) => {
        const price = p.price ?? 1;
        const dev_pct = Math.round((price - 1) * 10000) / 100;  // 4 decimals → 2 decimal percent
        return {
          symbol: p.symbol,
          name: p.name,
          price: Math.round(price * 10000) / 10000,
          dev_pct,
          circ_usd: Math.round(p.circulating?.peggedUSD ?? 0),
          peg_status: pegStatus(dev_pct),
          peg_mechanism: mechLabel(p.pegMechanism),
        };
      });

      const on_peg_count = stablecoins.filter((s) => s.peg_status === "on-peg").length;
      const warning_count = stablecoins.filter((s) => s.peg_status === "warning").length;
      const depegged_count = stablecoins.filter((s) => s.peg_status === "depegged").length;
      const total_supply_usd = stablecoins.reduce((s, c) => s + c.circ_usd, 0);

      stablecoin_pegs = { stablecoins, on_peg_count, warning_count, depegged_count, total_supply_usd };
    }
  } catch {
    // Fall through with undefined stablecoin_pegs
  }

  const result = stablecoin_pegs && stablecoin_pegs.stablecoins.length > 0
    ? `${stablecoin_pegs.on_peg_count} on-peg · ${stablecoin_pegs.warning_count} warnings · ${stablecoin_pegs.depegged_count} depegged · ${stablecoin_pegs.stablecoins[0]?.symbol} ${stablecoin_pegs.stablecoins[0]?.dev_pct >= 0 ? "+" : ""}${stablecoin_pegs.stablecoins[0]?.dev_pct}%`
    : "Stablecoin peg data temporarily unavailable";

  return { service_type: "stablecoin-pegs", result, stablecoin_pegs, timestamp, delivered_to };
}

export async function deliverMiningPools(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let mining_pools: MiningPoolsData | undefined;

  try {
    const res = await fetch("https://mempool.space/api/v1/mining/pools/3d", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`mempool.space HTTP ${res.status}`);
    const data = await res.json() as {
      pools: Array<{ name: string; slug: string; blockCount: number; rank: number }>;
      blockCount: number;
      lastEstimatedHashrate3d: number;
    };

    const totalBlocks = data.blockCount;
    const hashrateEh = data.lastEstimatedHashrate3d / 1e18;

    const pools: MiningPoolEntry[] = data.pools.slice(0, 10).map((p) => ({
      name: p.name,
      slug: p.slug,
      block_count: p.blockCount,
      share_pct: Math.round((p.blockCount / totalBlocks) * 1000) / 10,
      rank: p.rank,
    }));

    // Nakamoto coefficient: fewest pools whose combined share exceeds 50%
    let nc = 0;
    let cumulative = 0;
    for (const p of data.pools) {
      cumulative += p.blockCount;
      nc++;
      if (cumulative / totalBlocks > 0.5) break;
    }

    const top3Pct = Math.round(
      data.pools.slice(0, 3).reduce((s, p) => s + p.blockCount, 0) / totalBlocks * 1000
    ) / 10;

    mining_pools = {
      pools,
      total_blocks_3d: totalBlocks,
      hashrate_eh: Math.round(hashrateEh * 10) / 10,
      nakamoto_coefficient: nc,
      top3_concentration_pct: top3Pct,
      window: "3 days",
    };
  } catch {
    // Fall through with undefined
  }

  const result = mining_pools && mining_pools.pools.length > 0
    ? `${mining_pools.pools[0].name} ${mining_pools.pools[0].share_pct}% · Nakamoto: ${mining_pools.nakamoto_coefficient} · ${mining_pools.hashrate_eh} EH/s`
    : "Mining pool data temporarily unavailable";

  return { service_type: "mining-pools", result, mining_pools, timestamp, delivered_to };
}

export async function deliverRwaTvl(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  let rwa_tvl: RwaTvlData | undefined;

  try {
    const res = await fetch("https://api.llama.fi/protocols", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`DeFi Llama HTTP ${res.status}`);

    const data = await res.json() as Array<{
      name: string;
      slug: string;
      category: string;
      tvl: number;
      change_1d: number | null;
      change_7d: number | null;
      chains: string[];
    }>;

    const rwaProtocols = data
      .filter((p) => p.category === "RWA" && p.tvl > 0)
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 10);

    if (rwaProtocols.length === 0) throw new Error("No RWA protocols found");

    const protocols: RwaProtocolEntry[] = rwaProtocols.map((p) => ({
      name: p.name,
      slug: p.slug,
      tvl_usd: Math.round(p.tvl),
      change_1d_pct: p.change_1d != null ? Math.round(p.change_1d * 10) / 10 : null,
      change_7d_pct: p.change_7d != null ? Math.round(p.change_7d * 10) / 10 : null,
      chains: p.chains ?? [],
    }));

    const total_tvl_usd = protocols.reduce((s, p) => s + p.tvl_usd, 0);

    // Dominant chain across all RWA protocols
    const chainCounts: Record<string, number> = {};
    for (const p of protocols) {
      for (const c of p.chains) {
        chainCounts[c] = (chainCounts[c] ?? 0) + 1;
      }
    }
    const top_chain = Object.entries(chainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Ethereum";

    // Weighted average 7d change for total TVL
    const validWeek = protocols.filter((p) => p.change_7d_pct != null);
    const week_change_pct = validWeek.length > 0
      ? Math.round(validWeek.reduce((s, p) => s + (p.change_7d_pct ?? 0) * p.tvl_usd, 0) / validWeek.reduce((s, p) => s + p.tvl_usd, 0) * 10) / 10
      : null;

    rwa_tvl = { protocols, total_tvl_usd, protocol_count: rwaProtocols.length, top_chain, week_change_pct };
  } catch {
    // Fall through with undefined
  }

  const fmtUsd = (v: number) =>
    v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toLocaleString()}`;

  const result = rwa_tvl && rwa_tvl.protocols.length > 0
    ? `Total RWA TVL: ${fmtUsd(rwa_tvl.total_tvl_usd)} · ${rwa_tvl.protocol_count} protocols · #1 ${rwa_tvl.protocols[0].name} ${fmtUsd(rwa_tvl.protocols[0].tvl_usd)}${rwa_tvl.week_change_pct != null ? ` · 7d: ${rwa_tvl.week_change_pct >= 0 ? "+" : ""}${rwa_tvl.week_change_pct}%` : ""}`
    : "RWA TVL data temporarily unavailable";

  return { service_type: "rwa-tvl", result, rwa_tvl, timestamp, delivered_to };
}
// Server-side cache for DeFi Llama /raises (10-min rate limit protection)
let _cryptoFundingCache: { data: CryptoFundingData; expires: number } | null = null;

/**
 * Fetches recent crypto VC funding rounds via DeFi Llama /raises.
 * Shows top rounds from the past 30 days sorted by amount raised.
 * Uses a 12-minute server-side cache to stay within DeFi Llama rate limits.
 */
export async function deliverCryptoFunding(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  // Return cached data if available and fresh
  if (_cryptoFundingCache && Date.now() < _cryptoFundingCache.expires) {
    const cf = _cryptoFundingCache.data;
    const fmtUsd = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}B` : `$${v}M`;
    const result = `${cf.round_count} rounds · $${cf.total_raised_usd_m}M raised (30d) · Top: ${cf.rounds[0].name} ${fmtUsd(cf.rounds[0].amount_usd_m)} ${cf.rounds[0].round} · #1 sector: ${cf.top_category}`;
    return { service_type: "crypto-funding", result, crypto_funding: cf, timestamp, delivered_to };
  }

  let crypto_funding: CryptoFundingData | undefined;

  try {
    const res = await fetch("https://api.llama.fi/raises", {
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "skill-tokenized-agents/1.0", Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`DeFi Llama HTTP ${res.status}`);

    const data = await res.json() as {
      raises: Array<{
        name: string;
        date: number;
        round: string | null;
        amount: number | null;
        category: string | null;
        categoryGroup: string | null;
        leadInvestors: string[];
        otherInvestors: string[];
      }>;
    };

    const PERIOD_DAYS = 30;
    const cutoff = (Date.now() / 1000) - PERIOD_DAYS * 86400;

    const recent = data.raises
      .filter((r) => r.date >= cutoff && r.amount != null && Number(r.amount) > 0)
      .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))
      .slice(0, 12);

    if (recent.length === 0) throw new Error("No recent funding rounds found");

    const rounds: FundingRoundEntry[] = recent.map((r) => ({
      name: r.name,
      date_ts: r.date,
      round: r.round ?? "Unknown",
      amount_usd_m: Math.round((r.amount ?? 0) * 10) / 10,
      category: r.category ?? r.categoryGroup ?? "Other",
      lead_investors: r.leadInvestors ?? [],
    }));

    const total_raised_usd_m = Math.round(rounds.reduce((s, r) => s + r.amount_usd_m, 0) * 10) / 10;

    // Most common category
    const catCount: Record<string, number> = {};
    for (const r of rounds) {
      catCount[r.category] = (catCount[r.category] ?? 0) + 1;
    }
    const top_category = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "DeFi";

    crypto_funding = { rounds, total_raised_usd_m, top_category, period_days: PERIOD_DAYS, round_count: rounds.length };
    // Store in server-side cache (12 min TTL to safely span the 10-min rate limit window)
    _cryptoFundingCache = { data: crypto_funding, expires: Date.now() + 12 * 60 * 1000 };
  } catch {
    // Fall through with undefined
  }

  const fmtUsd = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(1)}B` : `$${v}M`;

  const result = crypto_funding && crypto_funding.rounds.length > 0
    ? `${crypto_funding.round_count} rounds · $${crypto_funding.total_raised_usd_m}M raised (30d) · Top: ${crypto_funding.rounds[0].name} ${fmtUsd(crypto_funding.rounds[0].amount_usd_m)} ${crypto_funding.rounds[0].round} · #1 sector: ${crypto_funding.top_category}`
    : "Crypto funding data temporarily unavailable";

  return { service_type: "crypto-funding", result, crypto_funding, timestamp, delivered_to };
}

// Server-side cache for chain fees (15-min TTL — DeFi Llama rate limit protection)
let _chainFeesCache: { data: ChainFeesData; expires: number } | null = null;

const CHAIN_FEE_TARGETS = [
  "Ethereum", "Solana", "Hyperliquid L1", "Base", "BSC",
  "Arbitrum", "Polygon", "Tron", "Avalanche", "Optimism",
];

/**
 * Fetches 24-hour fee revenue for major blockchains via DeFi Llama.
 * Ranks chains by daily fee generation — a proxy for network activity and demand.
 * Makes parallel requests and caches for 15 minutes to stay within rate limits.
 */
export async function deliverChainFees(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_chainFeesCache && Date.now() < _chainFeesCache.expires) {
    const cf = _chainFeesCache.data;
    const fmtUsd = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v.toFixed(0)}`;
    const result = `${cf.top_chain} leads · 24h total ${fmtUsd(cf.total_24h)} · Top: ${cf.chains[0]?.chain} ${fmtUsd(cf.chains[0]?.fees_24h ?? 0)}${cf.chains[0]?.change_1d_pct != null ? ` (${cf.chains[0].change_1d_pct >= 0 ? "+" : ""}${cf.chains[0].change_1d_pct.toFixed(1)}%)` : ""}`;
    return { service_type: "chain-fees", result, chain_fees: cf, timestamp, delivered_to };
  }

  let chain_fees: ChainFeesData | undefined;

  try {
    const results = await Promise.allSettled(
      CHAIN_FEE_TARGETS.map(async (chain) => {
        const encodedChain = encodeURIComponent(chain);
        const res = await fetch(
          `https://api.llama.fi/overview/fees/${encodedChain}?dataType=dailyFees&excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true`,
          { signal: AbortSignal.timeout(12000), headers: { "User-Agent": "skill-tokenized-agents/1.0", Accept: "application/json" } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json() as { total24h?: number; change_1d?: number };
        return { chain, fees_24h: data.total24h ?? 0, change_1d_pct: data.change_1d ?? null } as ChainFeeEntry;
      })
    );

    const chains: ChainFeeEntry[] = results
      .filter((r): r is PromiseFulfilledResult<ChainFeeEntry> => r.status === "fulfilled" && r.value.fees_24h > 0)
      .map((r) => r.value)
      .sort((a, b) => b.fees_24h - a.fees_24h);

    if (chains.length === 0) throw new Error("No chain fee data returned");

    const total_24h = chains.reduce((s, c) => s + c.fees_24h, 0);
    const top_chain = chains[0].chain;
    chain_fees = { chains, total_24h, top_chain };
    _chainFeesCache = { data: chain_fees, expires: Date.now() + 15 * 60 * 1000 };
  } catch {
    // Fall through with undefined
  }

  const fmtUsd = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v.toFixed(0)}`;

  const result = chain_fees && chain_fees.chains.length > 0
    ? `${chain_fees.top_chain} leads · 24h total ${fmtUsd(chain_fees.total_24h)} · Top: ${chain_fees.chains[0].chain} ${fmtUsd(chain_fees.chains[0].fees_24h)}${chain_fees.chains[0].change_1d_pct != null ? ` (${chain_fees.chains[0].change_1d_pct >= 0 ? "+" : ""}${chain_fees.chains[0].change_1d_pct.toFixed(1)}%)` : ""}`
    : "Chain fee data temporarily unavailable";

  return { service_type: "chain-fees", result, chain_fees, timestamp, delivered_to };
}

// Server-side cache for chain TVL (20-min TTL)
let _chainTvlCache: { data: ChainTvlData; expires: number } | null = null;

/**
 * Fetches total-value-locked distribution across top blockchains via DeFi Llama.
 * Shows where DeFi capital is deployed — Ethereum, Solana, BSC, Base, Tron, etc.
 * Ranked by TVL with % share of total tracked DeFi. Cached 20 minutes.
 */
export async function deliverChainTvl(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_chainTvlCache && Date.now() < _chainTvlCache.expires) {
    const ct = _chainTvlCache.data;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;
    const result = `Total DeFi TVL: ${fmtUsd(ct.total_tvl)} · ETH dominance ${ct.eth_dominance_pct.toFixed(1)}% · Top: ${ct.chains[0]?.name} ${fmtUsd(ct.chains[0]?.tvl ?? 0)} (${ct.chains[0]?.share_pct.toFixed(1)}%)`;
    return { service_type: "chain-tvl", result, chain_tvl: ct, timestamp, delivered_to };
  }

  let chain_tvl: ChainTvlData | undefined;

  try {
    const res = await fetch("https://api.llama.fi/v2/chains", {
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "skill-tokenized-agents/1.0", Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`DeFi Llama HTTP ${res.status}`);

    const raw = await res.json() as Array<{ name: string; tvl?: number }>;

    // Sort by TVL descending, take top 12, exclude tiny/unknown entries
    const sorted = raw
      .filter((c) => typeof c.tvl === "number" && c.tvl > 1e6 && c.name)
      .sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0))
      .slice(0, 12);

    if (sorted.length === 0) throw new Error("No valid chain TVL data");

    const total_tvl = sorted.reduce((s, c) => s + (c.tvl ?? 0), 0);
    const chains: ChainTvlEntry[] = sorted.map((c) => ({
      name: c.name,
      tvl: c.tvl ?? 0,
      share_pct: total_tvl > 0 ? ((c.tvl ?? 0) / total_tvl) * 100 : 0,
    }));

    const eth = chains.find((c) => c.name === "Ethereum");
    const eth_dominance_pct = eth ? eth.share_pct : 0;
    const top_chain = chains[0].name;

    chain_tvl = { chains, total_tvl, eth_dominance_pct, top_chain };
    _chainTvlCache = { data: chain_tvl, expires: Date.now() + 20 * 60 * 1000 };
  } catch {
    // Fall through with undefined
  }

  const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;

  const result = chain_tvl && chain_tvl.chains.length > 0
    ? `Total DeFi TVL: ${fmtUsd(chain_tvl.total_tvl)} · ETH dominance ${chain_tvl.eth_dominance_pct.toFixed(1)}% · Top: ${chain_tvl.chains[0].name} ${fmtUsd(chain_tvl.chains[0].tvl)} (${chain_tvl.chains[0].share_pct.toFixed(1)}%)`
    : "Chain TVL data temporarily unavailable";

  return { service_type: "chain-tvl", result, chain_tvl, timestamp, delivered_to };
}

// Server-side cache for DeFi exploits (30-min TTL — data doesn't change frequently)
let _defiExploitsCache: { data: DefiExploitsData; expires: number } | null = null;

/**
 * Fetches recent DeFi exploit and hack incidents via DeFi Llama.
 * Shows the last 90 days of security incidents: total funds lost, most targeted chains,
 * and a ranked list of the largest exploits. A live feed of on-chain security risk.
 * Cached 30 minutes.
 */
export async function deliverDefiExploits(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_defiExploitsCache && Date.now() < _defiExploitsCache.expires) {
    const de = _defiExploitsCache.data;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}K`;
    const result = `${de.incident_count} exploits in ${de.period_days}d · $${(de.total_stolen_usd / 1e6).toFixed(0)}M stolen · Most targeted: ${de.most_targeted_chain} · Largest: ${de.incidents[0]?.name} ($${(de.incidents[0]?.amount / 1e6).toFixed(0)}M)`;
    return { service_type: "defi-exploits", result, defi_exploits: de, timestamp, delivered_to };
  }

  let defi_exploits: DefiExploitsData | undefined;

  try {
    const res = await fetch("https://api.llama.fi/hacks", {
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "skill-tokenized-agents/1.0", Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`DeFi Llama hacks HTTP ${res.status}`);

    const raw = await res.json() as Array<{
      date?: number;
      name?: string;
      amount?: number;
      chain?: string[];
      classification?: string;
      technique?: string;
    }>;

    const PERIOD_DAYS = 90;
    const cutoff = Date.now() / 1000 - PERIOD_DAYS * 86400;

    const recent = raw
      .filter((h) => typeof h.amount === "number" && h.amount > 0 && typeof h.date === "number" && h.date >= cutoff && h.name)
      .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

    if (recent.length === 0) throw new Error("No recent exploit data");

    const incidents: DefiExploitEntry[] = recent.slice(0, 10).map((h) => ({
      name: h.name ?? "Unknown",
      date: h.date ?? 0,
      amount: h.amount ?? 0,
      chain: h.chain ?? ["Unknown"],
      classification: h.classification ?? "Unknown",
      technique: h.technique ?? "Unknown",
    }));

    const total_stolen_usd = recent.reduce((s, h) => s + (h.amount ?? 0), 0);

    // Tally chain frequency across all recent incidents
    const chainFreq: Record<string, number> = {};
    for (const h of recent) {
      for (const c of (h.chain ?? [])) {
        chainFreq[c] = (chainFreq[c] ?? 0) + 1;
      }
    }
    const most_targeted_chain = Object.entries(chainFreq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Unknown";

    defi_exploits = { incidents, total_stolen_usd, incident_count: recent.length, most_targeted_chain, period_days: PERIOD_DAYS };
    _defiExploitsCache = { data: defi_exploits, expires: Date.now() + 30 * 60 * 1000 };
  } catch {
    // Fall through with undefined
  }

  const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}K`;

  const result = defi_exploits && defi_exploits.incidents.length > 0
    ? `${defi_exploits.incident_count} exploits in ${defi_exploits.period_days}d · ${fmtUsd(defi_exploits.total_stolen_usd)} stolen · Most targeted: ${defi_exploits.most_targeted_chain} · Largest: ${defi_exploits.incidents[0].name} (${fmtUsd(defi_exploits.incidents[0].amount)})`
    : "DeFi exploit data temporarily unavailable";

  return { service_type: "defi-exploits", result, defi_exploits, timestamp, delivered_to };
}

// Server-side cache for global DEX volume (10-min TTL)
let _globalDexCache: { data: GlobalDexData; expires: number } | null = null;

/**
 * Fetches top DEX protocols across all chains by 24h volume via DeFi Llama.
 * Covers Uniswap, Raydium, PancakeSwap, Orca, GMX, and more.
 * Cached 10 minutes.
 */
export async function deliverGlobalDex(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_globalDexCache && Date.now() < _globalDexCache.expires) {
    const gd = _globalDexCache.data;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;
    const result = `Total DEX Vol (24h): ${fmtUsd(gd.total_volume_24h)} · Top: ${gd.dexes[0]?.name} ${fmtUsd(gd.dexes[0]?.volume_24h ?? 0)} · ${gd.dexes.length} DEXes ranked`;
    return { service_type: "global-dex", result, global_dex: gd, timestamp, delivered_to };
  }

  let global_dex: GlobalDexData | undefined;

  try {
    const res = await fetch(
      "https://api.llama.fi/overview/dexs?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true",
      {
        signal: AbortSignal.timeout(12000),
        headers: { "User-Agent": "skill-tokenized-agents/1.0", Accept: "application/json" },
      }
    );
    if (!res.ok) throw new Error(`DeFi Llama DEX HTTP ${res.status}`);

    const json = await res.json() as {
      total24h?: number;
      protocols?: Array<{
        name?: string;
        chains?: string[];
        total24h?: number;
        change_1d?: number;
      }>;
    };

    const protocols = json.protocols ?? [];
    const sorted = protocols
      .filter((p) => typeof p.total24h === "number" && p.total24h > 0 && p.name)
      .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
      .slice(0, 12);

    if (sorted.length === 0) throw new Error("No DEX volume data");

    const total_volume_24h = json.total24h ?? sorted.reduce((s, p) => s + (p.total24h ?? 0), 0);

    const dexes: GlobalDexEntry[] = sorted.map((p) => ({
      name: p.name ?? "Unknown",
      chains: (p.chains ?? []).slice(0, 3),
      volume_24h: p.total24h ?? 0,
      change_pct: typeof p.change_1d === "number" ? p.change_1d : 0,
    }));

    global_dex = { dexes, total_volume_24h };
    _globalDexCache = { data: global_dex, expires: Date.now() + 10 * 60 * 1000 };
  } catch {
    // Fall through with undefined
  }

  const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;

  const result = global_dex && global_dex.dexes.length > 0
    ? `Total DEX Vol (24h): ${fmtUsd(global_dex.total_volume_24h)} · Top: ${global_dex.dexes[0].name} ${fmtUsd(global_dex.dexes[0].volume_24h)} · ${global_dex.dexes.length} DEXes ranked`
    : "Global DEX volume data temporarily unavailable";

  return { service_type: "global-dex", result, global_dex, timestamp, delivered_to };
}

// ---------------------------------------------------------------------------
// 51st service: Futures Term Structure
// ---------------------------------------------------------------------------

/** Parse an expiry date from a Deribit instrument name like "BTC-20MAR26" */
function parseDeribitExpiry(instrument: string): Date | null {
  const m = instrument.match(/-(\d{1,2})([A-Z]{3})(\d{2})$/);
  if (!m) return null;
  const [, dayStr, monthStr, yearStr] = m;
  const months: Record<string, number> = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
  };
  if (!(monthStr in months)) return null;
  return new Date(2000 + parseInt(yearStr, 10), months[monthStr], parseInt(dayStr, 10));
}

function formatExpiryLabel(instrument: string): string {
  if (instrument.endsWith("-PERPETUAL")) return "Perp";
  const expiry = parseDeribitExpiry(instrument);
  if (!expiry) return instrument;
  const month = expiry.toLocaleString("en-US", { month: "short" });
  return `${month} ${expiry.getDate()}`;
}

function parseFuturesEntries(
  results: Array<{ instrument_name?: string; mark_price?: number; estimated_delivery_price?: number }>,
  now: Date
): FuturesBasisEntry[] {
  const entries: FuturesBasisEntry[] = [];
  for (const r of results) {
    const name = r.instrument_name ?? "";
    const mark = r.mark_price ?? 0;
    const spot = r.estimated_delivery_price ?? 0;
    if (!name || mark <= 0 || spot <= 0) continue;

    const isPerp = name.endsWith("-PERPETUAL");
    let days = 0;
    if (!isPerp) {
      const expiry = parseDeribitExpiry(name);
      if (!expiry) continue;
      days = Math.max(0, Math.round((expiry.getTime() - now.getTime()) / 86_400_000));
    }

    const basis_usd = mark - spot;
    const basis_pct = (basis_usd / spot) * 100;
    const annualized_basis_pct =
      !isPerp && days >= 3 ? basis_pct * (365 / days) : null;

    entries.push({
      instrument: name,
      expiry_label: formatExpiryLabel(name),
      days_to_expiry: days,
      mark_price: mark,
      spot_price: spot,
      basis_usd,
      basis_pct,
      annualized_basis_pct,
    });
  }
  // Perpetual first, then ascending by days
  return entries.sort((a, b) => {
    if (a.days_to_expiry === 0) return -1;
    if (b.days_to_expiry === 0) return 1;
    return a.days_to_expiry - b.days_to_expiry;
  });
}

let _futuresBasisCache: { data: FuturesBasisData; expires: number } | null = null;

/**
 * Fetches BTC and ETH futures term structure from Deribit.
 * Shows mark price, basis vs spot, and annualized basis for each expiry.
 * Cached 5 minutes.
 */
export async function deliverFuturesBasis(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_futuresBasisCache && Date.now() < _futuresBasisCache.expires) {
    const fb = _futuresBasisCache.data;
    const nearest = fb.btc.find((e) => e.days_to_expiry > 0);
    const result = nearest
      ? `BTC Spot $${fb.btc_spot.toLocaleString(undefined, { maximumFractionDigits: 0 })} · Nearest basis ${nearest.basis_pct >= 0 ? "+" : ""}${nearest.basis_pct.toFixed(3)}% (${nearest.expiry_label}) · ${fb.btc.length + fb.eth.length} contracts`
      : "BTC/ETH futures term structure — Deribit";
    return { service_type: "futures-basis", result, futures_basis: fb, timestamp, delivered_to };
  }

  let futures_basis: FuturesBasisData | undefined;
  const now = new Date();

  try {
    const [btcRes, ethRes] = await Promise.all([
      fetch(
        "https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=BTC&kind=future",
        { signal: AbortSignal.timeout(12000), headers: { "User-Agent": "skill-tokenized-agents/1.0" } }
      ),
      fetch(
        "https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=ETH&kind=future",
        { signal: AbortSignal.timeout(12000), headers: { "User-Agent": "skill-tokenized-agents/1.0" } }
      ),
    ]);

    if (!btcRes.ok || !ethRes.ok) throw new Error("Deribit API error");

    const btcJson = await btcRes.json() as { result?: Array<{ instrument_name?: string; mark_price?: number; estimated_delivery_price?: number }> };
    const ethJson = await ethRes.json() as { result?: Array<{ instrument_name?: string; mark_price?: number; estimated_delivery_price?: number }> };

    const btcEntries = parseFuturesEntries(btcJson.result ?? [], now);
    const ethEntries = parseFuturesEntries(ethJson.result ?? [], now);

    if (btcEntries.length === 0) throw new Error("No BTC futures data");

    const btcSpot = btcEntries[0]?.spot_price ?? 0;
    const ethSpot = ethEntries[0]?.spot_price ?? 0;

    futures_basis = { btc: btcEntries, eth: ethEntries, btc_spot: btcSpot, eth_spot: ethSpot };
    _futuresBasisCache = { data: futures_basis, expires: Date.now() + 5 * 60 * 1000 };
  } catch {
    // Fall through with undefined
  }

  const nearest = futures_basis?.btc.find((e) => e.days_to_expiry > 0);
  const result = futures_basis && nearest
    ? `BTC Spot $${futures_basis.btc_spot.toLocaleString(undefined, { maximumFractionDigits: 0 })} · Nearest basis ${nearest.basis_pct >= 0 ? "+" : ""}${nearest.basis_pct.toFixed(3)}% (${nearest.expiry_label}) · ${futures_basis.btc.length + futures_basis.eth.length} contracts`
    : "BTC/ETH futures term structure data temporarily unavailable";

  return { service_type: "futures-basis", result, futures_basis, timestamp, delivered_to };
}

// ── DEX Aggregators cache ────────────────────────────────────────────────────
let _dexAggregatorsCache: { data: DexAggregatorsData; expires: number } | null = null;

/**
 * Fetches DEX aggregator volume rankings from DeFi Llama.
 * Shows top 10 DEX aggregators (Jupiter, 1inch, CoWSwap, etc.) by 24h routed volume.
 * Cached 10 minutes.
 */
export async function deliverDexAggregators(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_dexAggregatorsCache && Date.now() < _dexAggregatorsCache.expires) {
    const da = _dexAggregatorsCache.data;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;
    const top = da.aggregators[0];
    const result = `Total agg vol (24h): ${fmtUsd(da.total_volume_24h)} · Top: ${top?.name} ${fmtUsd(top?.volume_24h ?? 0)} · ${da.aggregators.length} aggregators`;
    return { service_type: "dex-aggregators", result, dex_aggregators: da, timestamp, delivered_to };
  }

  let dex_aggregators: DexAggregatorsData | undefined;

  try {
    const res = await fetch(
      "https://api.llama.fi/overview/aggregators?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true&dataType=dailyVolume",
      { signal: AbortSignal.timeout(12000), headers: { "User-Agent": "skill-tokenized-agents/1.0" } }
    );
    if (!res.ok) throw new Error(`DeFi Llama error ${res.status}`);

    const json = await res.json() as {
      total24h?: number;
      total7d?: number;
      protocols?: Array<{
        name?: string;
        chains?: string[];
        total24h?: number;
        total7d?: number;
        change_1d?: number | null;
      }>;
    };

    const protocols = json.protocols ?? [];
    const sorted = protocols
      .filter((p) => (p.total24h ?? 0) > 0)
      .sort((a, b) => (b.total24h ?? 0) - (a.total24h ?? 0))
      .slice(0, 10);

    const aggregators: DexAggregatorEntry[] = sorted.map((p) => ({
      name: p.name ?? "Unknown",
      chains: (p.chains ?? []).slice(0, 3),
      volume_24h: p.total24h ?? 0,
      volume_7d: p.total7d ?? 0,
      change_pct: p.change_1d ?? null,
    }));

    dex_aggregators = {
      aggregators,
      total_volume_24h: json.total24h ?? aggregators.reduce((s, a) => s + a.volume_24h, 0),
      total_volume_7d: json.total7d ?? aggregators.reduce((s, a) => s + a.volume_7d, 0),
    };
    _dexAggregatorsCache = { data: dex_aggregators, expires: Date.now() + 10 * 60 * 1000 };
  } catch {
    // Fall through with undefined
  }

  const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;
  const top = dex_aggregators?.aggregators[0];
  const result = dex_aggregators && top
    ? `Total agg vol (24h): ${fmtUsd(dex_aggregators.total_volume_24h)} · Top: ${top.name} ${fmtUsd(top.volume_24h)} · ${dex_aggregators.aggregators.length} aggregators`
    : "DEX aggregator volume data temporarily unavailable";

  return { service_type: "dex-aggregators", result, dex_aggregators, timestamp, delivered_to };
}

let _crossChainGasCache: { data: CrossChainGasData; expires: number } | null = null;

/**
 * Fetches real-time gas costs for a simple token transfer across 6 major chains:
 * Ethereum L1, Base, Arbitrum, Optimism, BNB Chain, and Solana.
 * Uses free public JSON-RPC endpoints for EVM chains and a fixed 5000-lamport
 * Solana fee. Token prices from CoinGecko. Cached 2 minutes.
 */
export async function deliverCrossChainGas(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_crossChainGasCache && Date.now() < _crossChainGasCache.expires) {
    const ccg = _crossChainGasCache.data;
    const result = cheapest_summary(ccg);
    return { service_type: "cross-chain-gas", result, cross_chain_gas: ccg, timestamp, delivered_to };
  }

  // Fetch token prices and all chain gas prices in parallel
  const chainDefs = [
    { name: "Ethereum L1", symbol: "ETH",  rpc: "https://1rpc.io/eth",               tokenKey: "eth" },
    { name: "Base",        symbol: "ETH",  rpc: "https://mainnet.base.org",           tokenKey: "eth" },
    { name: "Arbitrum",    symbol: "ETH",  rpc: "https://arb1.arbitrum.io/rpc",       tokenKey: "eth" },
    { name: "Optimism",    symbol: "ETH",  rpc: "https://mainnet.optimism.io",        tokenKey: "eth" },
    { name: "BNB Chain",   symbol: "BNB",  rpc: "https://bsc-dataseed.binance.org",   tokenKey: "bnb" },
  ] as const;

  const GAS_LIMIT = 21_000;

  let ethPrice = 2000, bnbPrice = 400, solPrice = 150;

  try {
    const priceRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,binancecoin,solana&vs_currencies=usd",
      { signal: AbortSignal.timeout(8000), headers: { "User-Agent": "skill-tokenized-agents/1.0" } }
    );
    if (priceRes.ok) {
      const pd = await priceRes.json() as {
        ethereum?: { usd: number };
        binancecoin?: { usd: number };
        solana?: { usd: number };
      };
      ethPrice = pd.ethereum?.usd ?? ethPrice;
      bnbPrice = pd.binancecoin?.usd ?? bnbPrice;
      solPrice  = pd.solana?.usd  ?? solPrice;
    }
  } catch {
    // Use fallback prices
  }

  const tokenPrices: Record<string, number> = { eth: ethPrice, bnb: bnbPrice };

  const gasResults = await Promise.allSettled(
    chainDefs.map((c) =>
      fetch(c.rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_gasPrice", params: [], id: 1 }),
        signal: AbortSignal.timeout(6000),
      }).then((r) => r.json() as Promise<{ result?: string }>)
    )
  );

  const chains: CrossChainGasEntry[] = [];
  let ethL1CostUsd = 0;

  for (let i = 0; i < chainDefs.length; i++) {
    const def = chainDefs[i];
    const res = gasResults[i];
    let gas_price_gwei: number | null = null;
    let transfer_cost_usd = 0;

    if (res.status === "fulfilled" && res.value?.result) {
      const weiHex = res.value.result;
      const wei = parseInt(weiHex, 16);
      if (!isNaN(wei) && wei > 0) {
        gas_price_gwei = Math.round((wei / 1e9) * 1000) / 1000;
        const costNative = (wei / 1e18) * GAS_LIMIT;
        transfer_cost_usd = costNative * tokenPrices[def.tokenKey];
      }
    }

    chains.push({
      chain: def.name,
      symbol: def.symbol,
      gas_price_gwei,
      transfer_cost_usd: Math.round(transfer_cost_usd * 100000) / 100000,
      relative_pct: 0, // recalculated below
    });
  }

  // Solana: 5000 lamports per simple transfer (base fee; priority fee not included)
  const solCostUsd = 5_000 * 1e-9 * solPrice;
  chains.push({
    chain: "Solana",
    symbol: "SOL",
    gas_price_gwei: null,
    transfer_cost_usd: Math.round(solCostUsd * 1_000_000) / 1_000_000,
    relative_pct: 0, // recalculated below
  });

  // Sort cheapest first (exclude failed chains with 0 cost)
  chains.sort((a, b) => {
    if (a.transfer_cost_usd === 0 && b.transfer_cost_usd > 0) return 1;
    if (b.transfer_cost_usd === 0 && a.transfer_cost_usd > 0) return -1;
    return a.transfer_cost_usd - b.transfer_cost_usd;
  });

  // Calculate relative_pct using ETH L1 cost as baseline
  const ethEntry = chains.find((c) => c.chain === "Ethereum L1");
  ethL1CostUsd = ethEntry?.transfer_cost_usd ?? 0;
  for (const c of chains) {
    if (c.chain === "Ethereum L1") {
      c.relative_pct = 100;
    } else if (ethL1CostUsd > 0 && c.transfer_cost_usd > 0) {
      c.relative_pct = Math.round((c.transfer_cost_usd / ethL1CostUsd) * 100);
    } else {
      c.relative_pct = 0;
    }
  }

  // Filter out chains that failed (0 cost due to RPC error) but keep at least something
  const validChains = chains.filter((c) => c.transfer_cost_usd > 0);
  const finalChains = validChains.length > 0 ? validChains : chains;

  const cross_chain_gas: CrossChainGasData = {
    chains: finalChains,
    cheapest: finalChains[0]?.chain ?? "Unknown",
    eth_base_fee_gwei: ethEntry?.gas_price_gwei ?? 0,
  };

  _crossChainGasCache = { data: cross_chain_gas, expires: Date.now() + 2 * 60 * 1000 };

  const result = cheapest_summary(cross_chain_gas);
  return { service_type: "cross-chain-gas", result, cross_chain_gas, timestamp, delivered_to };
}

function cheapest_summary(ccg: CrossChainGasData): string {
  if (!ccg.chains.length) return "Cross-chain gas data temporarily unavailable";
  const top3 = ccg.chains.slice(0, 3)
    .map((c) => `${c.chain}: $${c.transfer_cost_usd < 0.01 ? c.transfer_cost_usd.toFixed(6) : c.transfer_cost_usd.toFixed(4)}`)
    .join(" · ");
  return `Cheapest: ${ccg.cheapest} · ETH L1: ${ccg.eth_base_fee_gwei} Gwei · ${top3}`;
}

let _memeCoinsCache: { data: MemeCoinsData; expires: number } | null = null;

/**
 * Fetches meme coin rankings by market cap from CoinGecko.
 * Shows top 15 meme coins (DOGE, SHIB, PEPE, WIF, etc.) with price and 24h change.
 * Cached 5 minutes.
 */
export async function deliverMemeCoins(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_memeCoinsCache && Date.now() < _memeCoinsCache.expires) {
    const mc = _memeCoinsCache.data;
    const fmtMcap = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const result = `${mc.coins.length} meme coins · Total mcap ${fmtMcap(mc.total_market_cap_usd)} · Top gainer: ${mc.top_gainer} · Biggest drop: ${mc.top_loser}`;
    return { service_type: "meme-coins", result, meme_coins: mc, timestamp, delivered_to };
  }

  let meme_coins: MemeCoinsData | undefined;

  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=meme-token&order=market_cap_desc&per_page=15&page=1&price_change_percentage=24h",
      { signal: AbortSignal.timeout(12000), headers: { "User-Agent": "skill-tokenized-agents/1.0" } }
    );
    if (!res.ok) throw new Error(`CoinGecko error ${res.status}`);

    const json = await res.json() as Array<{
      name?: string;
      symbol?: string;
      current_price?: number;
      price_change_percentage_24h?: number | null;
      market_cap?: number;
      total_volume?: number;
    }>;

    const coins: MemeCoinEntry[] = json.map((c) => ({
      name: c.name ?? "Unknown",
      symbol: (c.symbol ?? "?").toUpperCase(),
      price_usd: c.current_price ?? 0,
      change_24h_pct: c.price_change_percentage_24h ?? null,
      market_cap_usd: c.market_cap ?? 0,
      volume_24h_usd: c.total_volume ?? 0,
    }));

    const total_market_cap_usd = coins.reduce((s, c) => s + c.market_cap_usd, 0);
    const withChange = coins.filter((c) => c.change_24h_pct != null);
    const sorted = [...withChange].sort((a, b) => (b.change_24h_pct ?? 0) - (a.change_24h_pct ?? 0));
    const top_gainer = sorted[0]?.symbol ?? "—";
    const top_loser = sorted[sorted.length - 1]?.symbol ?? "—";

    meme_coins = { coins, total_market_cap_usd, top_gainer, top_loser };
    _memeCoinsCache = { data: meme_coins, expires: Date.now() + 5 * 60 * 1000 };
  } catch {
    // Fall through with undefined
  }

  const fmtMcap = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
  const result = meme_coins && meme_coins.coins.length > 0
    ? `${meme_coins.coins.length} meme coins · Total mcap ${fmtMcap(meme_coins.total_market_cap_usd)} · Top gainer: ${meme_coins.top_gainer} · Biggest drop: ${meme_coins.top_loser}`
    : "Meme coin data temporarily unavailable";

  return { service_type: "meme-coins", result, meme_coins, timestamp, delivered_to };
}

let _hlTopPairsCache: { data: HlTopPairsData; expires: number } | null = null;

/**
 * Fetches the top 10 Hyperliquid perpetual pairs by 24h trading volume.
 * Shows volume, price, 24h change, open interest, and funding rate for each.
 * Reveals which assets are most actively traded on the largest perp DEX.
 * Cached 3 minutes.
 */
export async function deliverHlTopPairs(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_hlTopPairsCache && Date.now() < _hlTopPairsCache.expires) {
    const ht = _hlTopPairsCache.data;
    const fmtVol = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const result = `#1: ${ht.top_pair} ${fmtVol(ht.pairs[0]?.volume_24h_usd ?? 0)} · Total HL vol ${fmtVol(ht.total_volume_24h_usd)} · Top 10 pairs`;
    return { service_type: "hl-top-pairs", result, hl_top_pairs: ht, timestamp, delivered_to };
  }

  let hl_top_pairs: HlTopPairsData | undefined;

  try {
    const res = await fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "User-Agent": "skill-tokenized-agents/1.0" },
      body: JSON.stringify({ type: "metaAndAssetCtxs" }),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`Hyperliquid API HTTP ${res.status}`);

    const data = await res.json() as [
      { universe: Array<{ name: string }> },
      Array<{
        funding: string;
        openInterest: string;
        prevDayPx: string;
        dayNtlVlm: string;
        markPx: string;
      }>
    ];

    const [meta, ctxs] = data;

    const allPairs = meta.universe.map((asset, i) => {
      const ctx = ctxs[i];
      if (!ctx) return null;
      const markPx = parseFloat(ctx.markPx) || 0;
      const prevDayPx = parseFloat(ctx.prevDayPx) || 0;
      const volume_24h_usd = parseFloat(ctx.dayNtlVlm) || 0;
      const openInterest = parseFloat(ctx.openInterest) || 0;
      const funding_rate = parseFloat(ctx.funding) || 0;
      const price_change_pct = prevDayPx > 0 ? ((markPx - prevDayPx) / prevDayPx) * 100 : 0;
      return {
        symbol: asset.name,
        volume_24h_usd,
        mark_price: markPx,
        price_change_pct: Math.round(price_change_pct * 100) / 100,
        open_interest_usd: openInterest * markPx,
        funding_rate,
      } as HlPairEntry;
    }).filter((p): p is HlPairEntry => p !== null && p.volume_24h_usd > 0);

    // Sort by 24h volume descending, take top 10
    allPairs.sort((a, b) => b.volume_24h_usd - a.volume_24h_usd);
    const pairs = allPairs.slice(0, 10);

    const total_volume_24h_usd = allPairs.reduce((s, p) => s + p.volume_24h_usd, 0);
    const top_pair = pairs[0]?.symbol ?? "BTC";

    hl_top_pairs = { pairs, total_volume_24h_usd, top_pair };
    _hlTopPairsCache = { data: hl_top_pairs, expires: Date.now() + 3 * 60 * 1000 };
  } catch {
    // Fall through with undefined
  }

  const fmtVol = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`;
  const result = hl_top_pairs && hl_top_pairs.pairs.length > 0
    ? `#1: ${hl_top_pairs.top_pair} ${fmtVol(hl_top_pairs.pairs[0]?.volume_24h_usd ?? 0)} · Total HL vol ${fmtVol(hl_top_pairs.total_volume_24h_usd)} · Top 10 pairs`
    : "Hyperliquid data temporarily unavailable";

  return { service_type: "hl-top-pairs", result, hl_top_pairs, timestamp, delivered_to };
}

let _ethBeaconCache: { data: EthBeaconData; expires: number } | null = null;

export async function deliverEthBeacon(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  // Cache for 2 minutes — slot time is 12s, epoch is ~6.4 min
  if (_ethBeaconCache && Date.now() < _ethBeaconCache.expires) {
    const eb = _ethBeaconCache.data;
    const result = `Epoch ${eb.epoch.toLocaleString()} · Block #${eb.block_number.toLocaleString()} · ${eb.gas_util_pct.toFixed(1)}% gas · Base fee ${eb.base_fee_gwei.toFixed(4)} Gwei`;
    return { service_type: "eth-beacon", result, eth_beacon: eb, timestamp, delivered_to };
  }

  let eth_beacon: EthBeaconData | undefined;

  try {
    // Fetch beacon head, finality checkpoints, and latest EL block in parallel
    const CL_BASE = "https://ethereum-beacon-api.publicnode.com";
    const EL_URL  = "https://ethereum.publicnode.com";

    const [headRes, finalityRes, blockRes] = await Promise.all([
      fetch(`${CL_BASE}/eth/v1/beacon/headers/head`, {
        headers: { "Accept": "application/json", "User-Agent": "skill-tokenized-agents/1.0" },
        signal: AbortSignal.timeout(10000),
      }),
      fetch(`${CL_BASE}/eth/v1/beacon/states/head/finality_checkpoints`, {
        headers: { "Accept": "application/json", "User-Agent": "skill-tokenized-agents/1.0" },
        signal: AbortSignal.timeout(10000),
      }),
      fetch(EL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": "skill-tokenized-agents/1.0" },
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getBlockByNumber", params: ["latest", false], id: 1 }),
        signal: AbortSignal.timeout(10000),
      }),
    ]);

    if (!headRes.ok) throw new Error(`CL head HTTP ${headRes.status}`);
    if (!finalityRes.ok) throw new Error(`CL finality HTTP ${finalityRes.status}`);
    if (!blockRes.ok) throw new Error(`EL block HTTP ${blockRes.status}`);

    const headData = await headRes.json() as {
      data: { header: { message: { slot: string } } };
    };
    const finalityData = await finalityRes.json() as {
      data: { finalized: { epoch: string } };
    };
    const blockData = await blockRes.json() as {
      result: {
        number: string;
        baseFeePerGas: string;
        gasUsed: string;
        gasLimit: string;
      };
    };

    const slot = parseInt(headData.data.header.message.slot, 10);
    const epoch = Math.floor(slot / 32);
    const slot_in_epoch = slot % 32;
    const finalized_epoch = parseInt(finalityData.data.finalized.epoch, 10);
    const finality_lag = epoch - finalized_epoch;

    const blk = blockData.result;
    const block_number = parseInt(blk.number, 16);
    const base_fee_gwei = parseInt(blk.baseFeePerGas, 16) / 1e9;
    const gas_used = parseInt(blk.gasUsed, 16);
    const gas_limit = parseInt(blk.gasLimit, 16);
    const gas_util_pct = gas_limit > 0 ? (gas_used / gas_limit) * 100 : 0;

    eth_beacon = {
      epoch,
      slot,
      slot_in_epoch,
      finalized_epoch,
      finality_lag,
      is_finalizing: finality_lag <= 3,
      block_number,
      base_fee_gwei: Math.round(base_fee_gwei * 10000) / 10000,
      gas_util_pct: Math.round(gas_util_pct * 10) / 10,
    };
    _ethBeaconCache = { data: eth_beacon, expires: Date.now() + 2 * 60 * 1000 };
  } catch {
    // Fall through with undefined
  }

  const result = eth_beacon
    ? `Epoch ${eth_beacon.epoch.toLocaleString()} · Block #${eth_beacon.block_number.toLocaleString()} · ${eth_beacon.gas_util_pct.toFixed(1)}% gas · Base fee ${eth_beacon.base_fee_gwei.toFixed(4)} Gwei`
    : "ETH beacon chain data temporarily unavailable";

  return { service_type: "eth-beacon", result, eth_beacon, timestamp, delivered_to };
}

let _restakingCache: { data: RestakingData; expires: number } | null = null;

/**
 * Fetches restaking protocol TVL rankings via DeFi Llama /protocols.
 * Filters for Restaking and Liquid Restaking categories.
 * EigenLayer, Symbiotic, Kelp, Puffer, and similar protocols.
 * Uses a 10-minute server-side cache.
 */
export async function deliverRestakingTvl(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_restakingCache && Date.now() < _restakingCache.expires) {
    const rd = _restakingCache.data;
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const result = `Total restaking: ${fmtTvl(rd.total_tvl)} · #1: ${rd.top_protocol} (${rd.dominant_pct.toFixed(1)}%) · ${rd.protocols.length} protocols`;
    return { service_type: "restaking-tvl", result, restaking_tvl: rd, timestamp, delivered_to };
  }

  let restaking_tvl: RestakingData | undefined;

  try {
    const res = await fetch("https://api.llama.fi/protocols", {
      signal: AbortSignal.timeout(12000),
      headers: { "User-Agent": "skill-tokenized-agents/1.0", Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`DeFi Llama HTTP ${res.status}`);

    const protocols = await res.json() as Array<{
      name: string;
      tvl: number | null;
      change_1d: number | null;
      change_7d: number | null;
      chains: string[];
      category: string | null;
    }>;

    const RESTAKING_CATEGORIES = new Set(["Restaking", "Liquid Restaking"]);

    const entries = protocols
      .filter((p) => RESTAKING_CATEGORIES.has(p.category ?? "") && (p.tvl ?? 0) > 0)
      .sort((a, b) => (b.tvl ?? 0) - (a.tvl ?? 0))
      .slice(0, 12)
      .map((p): RestakingProtocolEntry => ({
        name: p.name,
        tvl: p.tvl ?? 0,
        change_1d_pct: p.change_1d ?? null,
        change_7d_pct: p.change_7d ?? null,
        chains: (p.chains ?? []).slice(0, 3),
        category: p.category ?? "Restaking",
      }));

    if (entries.length === 0) throw new Error("No restaking protocols found");

    const total_tvl = entries.reduce((s, p) => s + p.tvl, 0);
    const top_protocol = entries[0].name;
    const dominant_pct = Math.round((entries[0].tvl / total_tvl) * 1000) / 10;

    restaking_tvl = { protocols: entries, total_tvl, top_protocol, dominant_pct };
    _restakingCache = { data: restaking_tvl, expires: Date.now() + 10 * 60 * 1000 };
  } catch {
    // Fall through with undefined
  }

  const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`;

  const result = restaking_tvl && restaking_tvl.protocols.length > 0
    ? `Total restaking: ${fmtTvl(restaking_tvl.total_tvl)} · #1: ${restaking_tvl.top_protocol} (${restaking_tvl.dominant_pct.toFixed(1)}%) · ${restaking_tvl.protocols.length} protocols`
    : "Restaking TVL data temporarily unavailable";

  return { service_type: "restaking-tvl", result, restaking_tvl, timestamp, delivered_to };
}

let _btcHalvingCache: { data: BtcHalvingData; expires: number } | null = null;

/**
 * Bitcoin Halving Countdown — current block height, blocks to next halving,
 * epoch progress, estimated date, supply mined %, and halving history.
 * Uses mempool.space public API (no auth required).
 * 5-minute server-side cache.
 */
export async function deliverBtcHalving(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_btcHalvingCache && Date.now() < _btcHalvingCache.expires) {
    const hv = _btcHalvingCache.data;
    const result = `Block ${hv.current_height.toLocaleString()} · Next halving in ${hv.blocks_remaining.toLocaleString()} blocks · ~${hv.estimated_days}d · ${hv.epoch_progress_pct.toFixed(1)}% through epoch`;
    return { service_type: "btc-halving", result, btc_halving: hv, timestamp, delivered_to };
  }

  let btc_halving: BtcHalvingData | undefined;

  try {
    const [heightRes, diffRes] = await Promise.all([
      fetch("https://mempool.space/api/blocks/tip/height", {
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "skill-tokenized-agents/1.0" },
      }),
      fetch("https://mempool.space/api/v1/difficulty-adjustment", {
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "skill-tokenized-agents/1.0" },
      }),
    ]);
    if (!heightRes.ok || !diffRes.ok) throw new Error("mempool.space API error");

    const currentHeight = parseInt(await heightRes.text(), 10);
    const diffData = await diffRes.json() as { timeAvg: number };

    const HALVING_INTERVAL = 210_000;
    const halvingNumber = Math.floor(currentHeight / HALVING_INTERVAL);
    const lastHalvingHeight = halvingNumber * HALVING_INTERVAL;
    const nextHalvingHeight = (halvingNumber + 1) * HALVING_INTERVAL;
    const blocksRemaining = nextHalvingHeight - currentHeight;
    const epochProgressPct = Math.round(((currentHeight - lastHalvingHeight) / HALVING_INTERVAL) * 1000) / 10;

    const avgBlockTimeSecs = Math.round(diffData.timeAvg / 1000);
    const estimatedDays = Math.round(blocksRemaining * avgBlockTimeSecs / 86400);
    const estimatedDate = new Date(Date.now() + blocksRemaining * avgBlockTimeSecs * 1000);
    const estimatedDateStr = estimatedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Block reward: 50 BTC halved halvingNumber times
    const currentRewardBtc = 50 / Math.pow(2, halvingNumber);
    const nextRewardBtc = currentRewardBtc / 2;

    // Supply mined: sum completed epochs + current epoch
    const SUPPLY_CAP = 21_000_000;
    let supplyMined = 0;
    for (let i = 0; i < halvingNumber; i++) {
      supplyMined += HALVING_INTERVAL * (50 / Math.pow(2, i));
    }
    supplyMined += (currentHeight - lastHalvingHeight) * currentRewardBtc;
    const supplyMinedPct = Math.round((supplyMined / SUPPLY_CAP) * 1000) / 10;

    const halvings: BtcHalvingEntry[] = [
      { number: 1, block_height: 210_000, date_approx: "Nov 2012", reward_before_btc: 50, reward_after_btc: 25 },
      { number: 2, block_height: 420_000, date_approx: "Jul 2016", reward_before_btc: 25, reward_after_btc: 12.5 },
      { number: 3, block_height: 630_000, date_approx: "May 2020", reward_before_btc: 12.5, reward_after_btc: 6.25 },
      { number: 4, block_height: 840_000, date_approx: "Apr 2024", reward_before_btc: 6.25, reward_after_btc: 3.125 },
    ];

    btc_halving = {
      current_height: currentHeight,
      next_halving_height: nextHalvingHeight,
      blocks_remaining: blocksRemaining,
      epoch_progress_pct: epochProgressPct,
      current_reward_btc: currentRewardBtc,
      next_reward_btc: nextRewardBtc,
      estimated_days: estimatedDays,
      estimated_date: estimatedDateStr,
      avg_block_time_secs: avgBlockTimeSecs,
      supply_mined_pct: supplyMinedPct,
      halvings,
    };
    _btcHalvingCache = { data: btc_halving, expires: Date.now() + 5 * 60 * 1000 };
  } catch {
    // Fall through with undefined
  }

  const result = btc_halving
    ? `Block ${btc_halving.current_height.toLocaleString()} · Next halving in ${btc_halving.blocks_remaining.toLocaleString()} blocks · ~${btc_halving.estimated_days}d · ${btc_halving.epoch_progress_pct.toFixed(1)}% through epoch`
    : "Bitcoin halving data temporarily unavailable";

  return { service_type: "btc-halving", result, btc_halving, timestamp, delivered_to };
}

let _solValidatorsCache: { data: SolValidatorsData; expires: number } | null = null;
const SOL_VALIDATORS_TTL = 5 * 60 * 1000; // 5 minutes

export async function deliverSolValidators(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_solValidatorsCache && Date.now() < _solValidatorsCache.expires) {
    const hv = _solValidatorsCache.data;
    const result = `${hv.total_validators} validators · Top stake: ${hv.validators[0]?.activated_stake_sol.toFixed(0)}K SOL (${hv.validators[0]?.stake_pct.toFixed(2)}%) · Avg commission: ${hv.avg_commission.toFixed(1)}%`;
    return { service_type: "sol-validators", result, sol_validators: hv, timestamp, delivered_to };
  }

  let sol_validators: SolValidatorsData | undefined;

  try {
    const res = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getVoteAccounts",
        params: [{ commitment: "finalized" }],
      }),
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) throw new Error(`RPC error ${res.status}`);
    const json = await res.json();

    const current: Array<{
      votePubkey: string;
      nodePubkey: string;
      activatedStake: number;
      commission: number;
      lastVote: number;
    }> = json.result?.current ?? [];

    const delinquent: Array<{ votePubkey: string; activatedStake: number }> =
      json.result?.delinquent ?? [];

    // Sort by stake descending, take top 10
    const sorted = [...current].sort((a, b) => b.activatedStake - a.activatedStake);
    const LAMPORTS_PER_SOL = 1_000_000_000;
    const totalStakeLamports = sorted.reduce((s, v) => s + v.activatedStake, 0) +
      delinquent.reduce((s, v) => s + v.activatedStake, 0);
    const totalStakeSol = totalStakeLamports / LAMPORTS_PER_SOL;

    const top10 = sorted.slice(0, 10);
    const avgCommission = top10.length > 0
      ? top10.reduce((s, v) => s + v.commission, 0) / top10.length
      : 0;

    const validators: SolValidatorEntry[] = top10.map((v, i) => {
      const stakeSol = v.activatedStake / LAMPORTS_PER_SOL;
      const np = v.nodePubkey;
      return {
        rank: i + 1,
        vote_pubkey: v.votePubkey,
        node_pubkey_short: np.slice(0, 4) + "…" + np.slice(-4),
        activated_stake_sol: stakeSol / 1000, // show in thousands
        stake_pct: totalStakeSol > 0 ? (stakeSol / totalStakeSol) * 100 : 0,
        commission: v.commission,
        last_vote: v.lastVote,
        status: "active",
      };
    });

    sol_validators = {
      validators,
      total_stake_sol: totalStakeSol / 1_000_000, // show in millions
      total_validators: current.length,
      delinquent_count: delinquent.length,
      avg_commission: avgCommission,
      slot_height: top10[0]?.lastVote ?? 0,
    };

    _solValidatorsCache = { data: sol_validators, expires: Date.now() + SOL_VALIDATORS_TTL };
  } catch (_e) {
    // Fall through with undefined sol_validators
  }

  const result = sol_validators
    ? `${sol_validators.total_validators} validators · Top stake: ${sol_validators.validators[0]?.activated_stake_sol.toFixed(0)}K SOL (${sol_validators.validators[0]?.stake_pct.toFixed(2)}%) · Avg commission: ${sol_validators.avg_commission.toFixed(1)}%`
    : "Solana validator data temporarily unavailable";

  return { service_type: "sol-validators", result, sol_validators, timestamp, delivered_to };
}

let _stableYieldsCache: { data: StableYieldsData; expires: number } | null = null;
const STABLE_YIELDS_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetches top stablecoin yield opportunities across DeFi protocols via DeFi Llama.
 * Shows highest-APY pools for stablecoins (USDC, USDT, DAI, etc.) with TVL context.
 * Sorted by APY descending; filters out tiny pools and extreme outliers.
 */
export async function deliverStableYields(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_stableYieldsCache && Date.now() < _stableYieldsCache.expires) {
    const sy = _stableYieldsCache.data;
    const result = `Best: ${sy.highest_apy.toFixed(1)}% APY (${sy.highest_protocol}) · Avg: ${sy.avg_stablecoin_apy.toFixed(1)}% · ${sy.pools.length} pools · $${(sy.total_shown_tvl / 1e9).toFixed(1)}B TVL`;
    return { service_type: "stable-yields", result, stable_yields: sy, timestamp, delivered_to };
  }

  let stable_yields: StableYieldsData | undefined;

  try {
    const res = await fetch("https://yields.llama.fi/pools", {
      headers: { Accept: "application/json", "User-Agent": "skill-tokenized-agents/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const json = (await res.json()) as {
        data: Array<{
          pool: string;
          project: string;
          chain: string;
          symbol: string;
          apy: number;
          tvlUsd: number;
          stablecoin: boolean;
        }>;
      };

      // Only show well-known major stablecoins (filter exotic/pegged assets)
      const MAJOR_STABLECOINS = new Set([
        "USDC", "USDT", "DAI", "FRAX", "PYUSD", "GUSD", "TUSD",
        "USDP", "LUSD", "EUSD", "USDS", "BUSD", "FDUSD", "CRVUSD",
        "USDC.E", "USDC-E", "USDC.EXG", "USDT.E",
      ]);
      const baseSymbol = (s: string) => s.split("-")[0].split(".")[0].toUpperCase();

      // Filter: major stablecoin pools only, meaningful TVL, sane APY range
      const eligible = (json.data ?? []).filter(
        (p) =>
          p.stablecoin === true &&
          MAJOR_STABLECOINS.has(baseSymbol(p.symbol)) &&
          typeof p.apy === "number" &&
          p.apy > 0.5 &&
          p.apy <= 20 &&          // exclude high-incentive outliers
          (p.tvlUsd ?? 0) >= 10_000_000,  // $10M+ TVL for quality
      );

      // Sort by APY descending, take top 15
      eligible.sort((a, b) => b.apy - a.apy);
      const top = eligible.slice(0, 15);

      if (top.length > 0) {
        const pools: StableYieldEntry[] = top.map((p) => ({
          protocol: p.project
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          chain: p.chain,
          symbol: p.symbol.split("-")[0].toUpperCase(), // normalize "USDC-A" → "USDC"
          apy_pct: parseFloat(p.apy.toFixed(2)),
          tvl_usd: p.tvlUsd,
        }));

        const avg = pools.reduce((s, p) => s + p.apy_pct, 0) / pools.length;
        const best = pools[0];

        stable_yields = {
          pools,
          avg_stablecoin_apy: parseFloat(avg.toFixed(2)),
          highest_protocol: best.protocol,
          highest_apy: best.apy_pct,
          total_shown_tvl: pools.reduce((s, p) => s + p.tvl_usd, 0),
        };

        _stableYieldsCache = { data: stable_yields, expires: Date.now() + STABLE_YIELDS_TTL };
      }
    }
  } catch {
    // Fall through with undefined stable_yields
  }

  const result = stable_yields
    ? `Best: ${stable_yields.highest_apy.toFixed(1)}% APY (${stable_yields.highest_protocol}) · Avg: ${stable_yields.avg_stablecoin_apy.toFixed(1)}% · ${stable_yields.pools.length} pools · $${(stable_yields.total_shown_tvl / 1e9).toFixed(1)}B TVL`
    : "Stablecoin yield data temporarily unavailable";

  return { service_type: "stable-yields", result, stable_yields, timestamp, delivered_to };
}

let _btcTreasuryCache: { data: BtcTreasuryData; expires: number } | null = null;
const BTC_TREASURY_TTL = 10 * 60 * 1000; // 10 minutes (data changes infrequently)

/**
 * Fetches public company Bitcoin treasury holdings via CoinGecko.
 * Shows total BTC held by publicly-traded companies (Strategy/MicroStrategy, MARA, etc.),
 * with top 10 holders ranked by BTC amount.
 */
export async function deliverBtcTreasury(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_btcTreasuryCache && Date.now() < _btcTreasuryCache.expires) {
    const bt = _btcTreasuryCache.data;
    const fmtBtc = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n.toFixed(0)}`;
    const result = `${fmtBtc(bt.total_holdings)} BTC ($${(bt.total_value_usd / 1e9).toFixed(1)}B) · ${bt.company_count} companies · #1: ${bt.top_holder} (${fmtBtc(bt.top_holder_btc)} BTC, ${bt.top_holder_pct.toFixed(1)}% of corp holdings)`;
    return { service_type: "btc-treasury", result, btc_treasury: bt, timestamp, delivered_to };
  }

  let btc_treasury: BtcTreasuryData | undefined;

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/companies/public_treasury/bitcoin", {
      headers: { Accept: "application/json", "User-Agent": "skill-tokenized-agents/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      const json = (await res.json()) as {
        total_holdings: number;
        total_value_usd: number;
        market_cap_dominance: number;
        companies: Array<{
          name: string;
          symbol: string;
          country: string;
          total_holdings: number;
          total_current_value_usd: number;
          percentage_of_total_supply: number;
        }>;
      };

      if (json.companies && json.companies.length > 0) {
        const top10 = json.companies.slice(0, 10).map((c) => ({
          name: c.name,
          symbol: c.symbol,
          country: c.country ?? "—",
          total_btc: c.total_holdings,
          value_usd: c.total_current_value_usd,
          pct_of_supply: parseFloat((c.percentage_of_total_supply ?? 0).toFixed(3)),
        }));

        const topHolder = top10[0];
        const topHolderPct = (topHolder.total_btc / json.total_holdings) * 100;

        btc_treasury = {
          total_holdings: json.total_holdings,
          total_value_usd: json.total_value_usd,
          market_cap_dominance: json.market_cap_dominance ?? 0,
          company_count: json.companies.length,
          top_companies: top10,
          top_holder: topHolder.name,
          top_holder_btc: topHolder.total_btc,
          top_holder_pct: parseFloat(topHolderPct.toFixed(1)),
        };

        _btcTreasuryCache = { data: btc_treasury, expires: Date.now() + BTC_TREASURY_TTL };
      }
    }
  } catch {
    // Fall through with undefined btc_treasury
  }

  const fmtBtc = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n.toFixed(0)}`;
  const result = btc_treasury
    ? `${fmtBtc(btc_treasury.total_holdings)} BTC ($${(btc_treasury.total_value_usd / 1e9).toFixed(1)}B) · ${btc_treasury.company_count} companies · #1: ${btc_treasury.top_holder} (${fmtBtc(btc_treasury.top_holder_btc)} BTC, ${btc_treasury.top_holder_pct.toFixed(1)}% of corp holdings)`
    : "Bitcoin treasury data temporarily unavailable";

  return { service_type: "btc-treasury", result, btc_treasury, timestamp, delivered_to };
}

const GAS_PER_BLOB = 131072; // EIP-4844: each blob occupies 2^17 blob gas units
const ETH_BLOB_TTL = 15 * 1000; // 15 seconds — matches Ethereum block time
let _ethBlobCache: { data: EthBlobData; expires: number } | null = null;

export async function deliverEthBlob(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_ethBlobCache && Date.now() < _ethBlobCache.expires) {
    const eb = _ethBlobCache.data;
    const fmtBlobCost = (v: number) => v < 0.000001 ? v.toExponential(2) : v.toFixed(6);
    const result = `Blob base fee: ${eb.blob_base_fee_gwei.toFixed(4)} gwei · ${eb.blobs_in_latest}/${eb.max_blobs_per_block} blobs · ${eb.fee_tier} · 1-blob cost: ${fmtBlobCost(eb.blob_cost_eth)} ETH`;
    return { service_type: "eth-blob", result, eth_blob: eb, timestamp, delivered_to };
  }

  let eth_blob: EthBlobData | undefined;

  try {
    const EL_URL = "https://ethereum.publicnode.com";
    const headers = { "Content-Type": "application/json", "User-Agent": "skill-tokenized-agents/1.0" };

    const [blobFeeRes, blockRes] = await Promise.all([
      fetch(EL_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blobBaseFee", params: [], id: 1 }),
        signal: AbortSignal.timeout(8000),
      }),
      fetch(EL_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getBlockByNumber", params: ["latest", false], id: 2 }),
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    if (blobFeeRes.ok && blockRes.ok) {
      const [blobFeeJson, blockJson] = await Promise.all([blobFeeRes.json(), blockRes.json()]) as [
        { result: string },
        { result: { number: string; blobGasUsed?: string } },
      ];

      const blobBaseFeeWei = parseInt(blobFeeJson.result, 16);
      const block = blockJson.result;
      const blobGasUsed = parseInt(block.blobGasUsed ?? "0x0", 16);
      const blobsInLatest = Math.round(blobGasUsed / GAS_PER_BLOB);
      const blockNumber = parseInt(block.number, 16);

      const blobBaseFeeGwei = blobBaseFeeWei / 1e9;
      const blobCostEth = (blobBaseFeeWei * GAS_PER_BLOB) / 1e18;
      const utilizationPct = (blobsInLatest / 6) * 100;

      const feeTier =
        blobBaseFeeGwei < 0.01 ? "Cheap"
        : blobBaseFeeGwei < 0.1 ? "Moderate"
        : "Expensive";

      eth_blob = {
        blob_base_fee_gwei: parseFloat(blobBaseFeeGwei.toFixed(6)),
        blobs_in_latest: blobsInLatest,
        max_blobs_per_block: 6,
        target_blobs_per_block: 3,
        utilization_pct: parseFloat(utilizationPct.toFixed(1)),
        block_number: blockNumber,
        fee_tier: feeTier,
        blob_cost_eth: parseFloat(blobCostEth.toFixed(8)),
      };

      _ethBlobCache = { data: eth_blob, expires: Date.now() + ETH_BLOB_TTL };
    }
  } catch {
    // Fall through with undefined eth_blob
  }

  const fmtBlobCost = (v: number) => v < 0.000001 ? v.toExponential(2) : v.toFixed(6);
  const result = eth_blob
    ? `Blob base fee: ${eth_blob.blob_base_fee_gwei.toFixed(4)} gwei · ${eth_blob.blobs_in_latest}/${eth_blob.max_blobs_per_block} blobs · ${eth_blob.fee_tier} · 1-blob cost: ${fmtBlobCost(eth_blob.blob_cost_eth)} ETH`
    : "Ethereum blob fee data temporarily unavailable";

  return { service_type: "eth-blob", result, eth_blob, timestamp, delivered_to };
}

// EIP-1559 ETH supply dynamics: burn rate vs validator issuance
// Uses batch JSON-RPC to sample 20 recent blocks and compute average burn
const ETH_SUPPLY_TTL = 30 * 1000; // 30 seconds
let _ethSupplyCache: { data: EthSupplyData; expires: number } | null = null;

// ETH PoS issuance is approximately 1700 ETH/day with ~1M active validators
// Formula: base_rewards * 64 * slots/day ≈ 1700 ETH/day
const ETH_ISSUANCE_PER_DAY = 1700;
const BLOCKS_PER_HOUR = 300; // ~12s block time

export async function deliverEthSupply(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_ethSupplyCache && Date.now() < _ethSupplyCache.expires) {
    const es = _ethSupplyCache.data;
    const sign = es.net_per_hour >= 0 ? "+" : "";
    const status = es.is_deflationary ? "🔥 Deflationary" : "Inflationary";
    const result = `${status} · Burn: ${es.burn_per_hour.toFixed(2)} ETH/hr · Issue: ${es.issuance_per_hour.toFixed(2)} ETH/hr · Net: ${sign}${es.net_per_hour.toFixed(2)} ETH/hr`;
    return { service_type: "eth-supply", result, eth_supply: es, timestamp, delivered_to };
  }

  let eth_supply: EthSupplyData | undefined;

  try {
    const EL_URL = "https://ethereum.publicnode.com";
    const headers = { "Content-Type": "application/json", "User-Agent": "skill-tokenized-agents/1.0" };

    // Get latest block number
    const latestRes = await fetch(EL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 0 }),
      signal: AbortSignal.timeout(8000),
    });
    if (!latestRes.ok) throw new Error(`HTTP ${latestRes.status}`);
    const latestJson = await latestRes.json() as { result: string };
    const latestBlock = parseInt(latestJson.result, 16);

    // Batch fetch last 20 blocks
    const SAMPLES = 20;
    const batch = Array.from({ length: SAMPLES }, (_, i) => ({
      jsonrpc: "2.0",
      id: i + 1,
      method: "eth_getBlockByNumber",
      params: [("0x" + (latestBlock - SAMPLES + i + 1).toString(16)), false],
    }));

    const batchRes = await fetch(EL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(batch),
      signal: AbortSignal.timeout(15000),
    });
    if (!batchRes.ok) throw new Error(`Batch HTTP ${batchRes.status}`);
    const blocks = await batchRes.json() as Array<{ result: { baseFeePerGas: string; gasUsed: string } }>;

    let totalBurnEth = 0;
    let totalBaseFeeWei = BigInt(0);
    let totalGasUsed = BigInt(0);
    let validBlocks = 0;

    for (const b of blocks) {
      if (!b.result) continue;
      const baseFeeWei = BigInt(b.result.baseFeePerGas);
      const gasUsed = BigInt(b.result.gasUsed);
      const burnWei = baseFeeWei * gasUsed;
      totalBurnEth += Number(burnWei) / 1e18;
      totalBaseFeeWei += baseFeeWei;
      totalGasUsed += gasUsed;
      validBlocks++;
    }

    if (validBlocks === 0) throw new Error("No valid blocks");

    const avgBurnPerBlock = totalBurnEth / validBlocks;
    const burnPerHour = avgBurnPerBlock * BLOCKS_PER_HOUR;
    const issuancePerHour = ETH_ISSUANCE_PER_DAY / 24;
    const netPerHour = burnPerHour - issuancePerHour;
    const avgBaseFeeGwei = Number(totalBaseFeeWei / BigInt(validBlocks)) / 1e9;
    const avgGasUsed = Number(totalGasUsed) / validBlocks;

    // Threshold: what base fee makes burn == issuance per block?
    // issuance_per_block = ETH_ISSUANCE_PER_DAY / 24 / BLOCKS_PER_HOUR ETH
    // threshold_wei = issuance_per_block * 1e18 / avg_gas_used
    const issuancePerBlockEth = issuancePerHour / BLOCKS_PER_HOUR;
    const deflationThresholdGwei = avgGasUsed > 0
      ? (issuancePerBlockEth * 1e18) / avgGasUsed / 1e9
      : 0;

    // Annualized supply change (ETH supply ~120M)
    const netPerYear = netPerHour * 8760;
    const supplyChangePctAnnual = (netPerYear / 120_000_000) * 100;

    eth_supply = {
      burn_per_hour: parseFloat(burnPerHour.toFixed(3)),
      issuance_per_hour: parseFloat(issuancePerHour.toFixed(3)),
      net_per_hour: parseFloat(netPerHour.toFixed(3)),
      is_deflationary: netPerHour > 0,
      base_fee_gwei: parseFloat(avgBaseFeeGwei.toFixed(4)),
      deflation_threshold_gwei: parseFloat(deflationThresholdGwei.toFixed(2)),
      blocks_sampled: validBlocks,
      supply_change_pct_annual: parseFloat(supplyChangePctAnnual.toFixed(4)),
    };

    _ethSupplyCache = { data: eth_supply, expires: Date.now() + ETH_SUPPLY_TTL };
  } catch {
    // Fall through with undefined eth_supply
  }

  const sign = eth_supply && eth_supply.net_per_hour >= 0 ? "+" : "";
  const result = eth_supply
    ? `${eth_supply.is_deflationary ? "Deflationary" : "Inflationary"} · Burn: ${eth_supply.burn_per_hour.toFixed(2)} ETH/hr · Issue: ${eth_supply.issuance_per_hour.toFixed(2)} ETH/hr · Net: ${sign}${eth_supply.net_per_hour.toFixed(2)} ETH/hr`
    : "ETH supply dynamics data temporarily unavailable";

  return { service_type: "eth-supply", result, eth_supply, timestamp, delivered_to };
}

// DAO Governance snapshot — active and recent proposals from major DeFi DAOs
// Uses the free public Snapshot GraphQL API (hub.snapshot.org/graphql)
const DAO_GOVERNANCE_TTL = 5 * 60 * 1000; // 5 minutes
let _daoGovernanceCache: { data: DaoGovernanceData; expires: number } | null = null;

const DAO_SPACES = [
  "uniswapgovernance.eth",
  "aave.eth",
  "arbitrumfoundation.eth",
  "compound-governance.eth",
  "optimism.eth",
  "ens.eth",
  "gitcoindao.eth",
  "gnosis.eth",
  "safe.eth",
  "curve.eth",
  "balancer.eth",
  "dydxgov.eth",
];

export async function deliverDaoGovernance(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_daoGovernanceCache && Date.now() < _daoGovernanceCache.expires) {
    const d = _daoGovernanceCache.data;
    const active = d.proposals.filter((p) => p.state === "active");
    const topActive = active[0];
    const result = active.length > 0
      ? `${active.length} active proposal${active.length !== 1 ? "s" : ""} · ${topActive.dao_name}: "${topActive.title.slice(0, 60)}${topActive.title.length > 60 ? "…" : ""}" (${topActive.votes.toLocaleString()} votes)`
      : `${d.proposals.length} recent proposals · ${d.proposals[0]?.dao_name ?? "DAO"}: "${d.proposals[0]?.title.slice(0, 60) ?? ""}…"`;
    return { service_type: "dao-governance", result, dao_governance: d, timestamp, delivered_to };
  }

  let dao_governance: DaoGovernanceData | undefined;

  const GQL_URL = "https://hub.snapshot.org/graphql";
  const headers = { "Content-Type": "application/json", "User-Agent": "skill-tokenized-agents/1.0" };

  const query = `{
    active: proposals(first: 8, where: {space_in: ${JSON.stringify(DAO_SPACES)}, state: "active"}, orderBy: "votes", orderDirection: desc) {
      id title state end votes space { id name }
    }
    recent: proposals(first: 8, where: {space_in: ${JSON.stringify(DAO_SPACES)}, state: "closed"}, orderBy: "end", orderDirection: desc) {
      id title state end votes space { id name }
    }
  }`;

  try {
    const res = await fetch(GQL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json() as {
      data: {
        active: Array<{ id: string; title: string; state: string; end: number; votes: number; space: { id: string; name: string } }>;
        recent: Array<{ id: string; title: string; state: string; end: number; votes: number; space: { id: string; name: string } }>;
      };
    };

    const activeRaw = json.data?.active ?? [];
    const recentRaw = json.data?.recent ?? [];

    // Combine: prefer active, fill with recent up to 8 total
    const combined = [...activeRaw, ...recentRaw].slice(0, 8);

    const proposals: DaoProposal[] = combined.map((p) => ({
      id: p.id,
      title: p.title,
      dao_name: p.space.name,
      dao_id: p.space.id,
      state: p.state as "active" | "closed" | "pending",
      votes: p.votes,
      end_timestamp: p.end,
    }));

    dao_governance = {
      proposals,
      active_count: activeRaw.length,
      closed_count: recentRaw.length,
    };

    _daoGovernanceCache = { data: dao_governance, expires: Date.now() + DAO_GOVERNANCE_TTL };
  } catch {
    // Fall through with undefined dao_governance
  }

  if (!dao_governance) {
    return { service_type: "dao-governance", result: "DAO governance data temporarily unavailable", timestamp, delivered_to };
  }

  const active = dao_governance.proposals.filter((p) => p.state === "active");
  const topActive = active[0] ?? dao_governance.proposals[0];
  const result = active.length > 0
    ? `${active.length} active proposal${active.length !== 1 ? "s" : ""} · ${topActive.dao_name}: "${topActive.title.slice(0, 60)}${topActive.title.length > 60 ? "…" : ""}" (${topActive.votes.toLocaleString()} votes)`
    : `${dao_governance.proposals.length} recent proposals · ${dao_governance.proposals[0]?.dao_name ?? "DAO"}: "${dao_governance.proposals[0]?.title.slice(0, 60) ?? ""}…"`;

  return { service_type: "dao-governance", result, dao_governance, timestamp, delivered_to };
}

// ---- Crypto Correlation ----
// Pearson correlation of 30-day daily log returns vs BTC
// CoinGecko free market_chart API — no key required

let _cryptoCorrelationCache: { data: CryptoCorrelationData; expires: number } | null = null;
const CRYPTO_CORRELATION_TTL = 60 * 60 * 1000; // 1 hour

interface CgMarketChart {
  prices: [number, number][];
}

function pearsonR(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const meanX = xs.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const meanY = ys.slice(0, n).reduce((a, b) => a + b, 0) / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

function dailyLogReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0 && prices[i] > 0) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
  }
  return returns;
}

function correlationStrength(r: number): CorrelationEntry["strength"] {
  const abs = Math.abs(r);
  if (r < 0) return "negative";
  if (abs >= 0.75) return "high";
  if (abs >= 0.50) return "moderate";
  return "low";
}

const CORRELATION_ASSETS: { symbol: string; cgId: string }[] = [
  { symbol: "ETH", cgId: "ethereum" },
  { symbol: "SOL", cgId: "solana" },
  { symbol: "BNB", cgId: "binancecoin" },
  { symbol: "XRP", cgId: "ripple" },
  { symbol: "DOGE", cgId: "dogecoin" },
  { symbol: "LINK", cgId: "chainlink" },
  { symbol: "AVAX", cgId: "avalanche-2" },
  { symbol: "SUI", cgId: "sui" },
];

async function fetchCgDailyPrices(cgId: string): Promise<number[]> {
  const url = `https://api.coingecko.com/api/v3/coins/${cgId}/market_chart?vs_currency=usd&days=30&interval=daily`;
  const res = await fetch(url, {
    headers: { "User-Agent": "skill-tokenized-agents/1.0", "Accept": "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status} for ${cgId}`);
  const json = await res.json() as CgMarketChart;
  return (json.prices ?? []).map(([, price]) => price);
}

export async function deliverCryptoCorrelation(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_cryptoCorrelationCache && Date.now() < _cryptoCorrelationCache.expires) {
    const d = _cryptoCorrelationCache.data;
    const top = d.assets[0];
    const result = top
      ? `${top.symbol}/BTC ρ=${top.correlation_30d.toFixed(2)} (${top.strength}) · ${d.assets.length} assets · 30-day correlation vs BTC`
      : "Correlation data cached";
    return { service_type: "crypto-correlation", result, crypto_correlation: d, timestamp, delivered_to };
  }

  let crypto_correlation: CryptoCorrelationData | undefined;

  try {
    // Fetch BTC first, then others with a small delay to respect free rate limits
    const btcPrices = await fetchCgDailyPrices("bitcoin");
    const btcReturns = dailyLogReturns(btcPrices);
    const btcPrice = btcPrices[btcPrices.length - 1] ?? 0;

    const entries: CorrelationEntry[] = [];

    for (const asset of CORRELATION_ASSETS) {
      try {
        // 200ms gap between calls to stay within free tier (30 req/min)
        await new Promise((r) => setTimeout(r, 200));
        const prices = await fetchCgDailyPrices(asset.cgId);
        const returns = dailyLogReturns(prices);
        const r = parseFloat(pearsonR(btcReturns, returns).toFixed(3));
        entries.push({ symbol: asset.symbol, correlation_30d: r, strength: correlationStrength(r) });
      } catch {
        // Skip this asset if fetch fails
      }
    }

    if (entries.length > 0) {
      entries.sort((a, b) => b.correlation_30d - a.correlation_30d);
      crypto_correlation = { assets: entries, btc_price_usd: btcPrice, period_days: 30 };
      _cryptoCorrelationCache = { data: crypto_correlation, expires: Date.now() + CRYPTO_CORRELATION_TTL };
    }
  } catch {
    // Fall through with undefined
  }

  if (!crypto_correlation) {
    return { service_type: "crypto-correlation", result: "Correlation data temporarily unavailable", timestamp, delivered_to };
  }

  const top = crypto_correlation.assets[0];
  const result = top
    ? `${top.symbol}/BTC ρ=${top.correlation_30d.toFixed(2)} (${top.strength}) · avg ρ=${(crypto_correlation.assets.reduce((s, a) => s + a.correlation_30d, 0) / crypto_correlation.assets.length).toFixed(2)} · 30-day rolling vs BTC`
    : "No correlation data";

  return { service_type: "crypto-correlation", result, crypto_correlation, timestamp, delivered_to };
}

// ---------------------------------------------------------------------------
// Chain Developer Activity — GitHub participation stats (66th service)
// Uses the GitHub stats/participation endpoint (no auth required).
// 60 req/hour unauthenticated — kept safe by a 2-hour cache.
// ---------------------------------------------------------------------------

interface GhParticipation {
  all: number[];    // 52 weekly commit counts (all contributors), most-recent last
  owner: number[];  // same, owner only
}

const CHAIN_DEV_REPOS: { chain: string; repo: string }[] = [
  { chain: "Ethereum",  repo: "ethereum/go-ethereum" },
  { chain: "Solana",    repo: "anza-xyz/agave" },
  { chain: "Sui",       repo: "MystenLabs/sui" },
  { chain: "Aptos",     repo: "aptos-labs/aptos-core" },
  { chain: "Avalanche", repo: "ava-labs/avalanchego" },
];

const CHAIN_DEV_TTL = 2 * 60 * 60 * 1000; // 2 hours
let _chainDevCache: { data: ChainDevData; expires: number } | null = null;

function devActivityLevel(commits4w: number): ChainDevEntry["activity_level"] {
  if (commits4w >= 80) return "high";
  if (commits4w >= 30) return "moderate";
  return "low";
}

async function fetchGhParticipation(repo: string): Promise<GhParticipation | null> {
  const url = `https://api.github.com/repos/${repo}/stats/participation`;
  // GitHub returns 202 while computing stats — retry once after a short delay
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, {
      headers: { "Accept": "application/vnd.github+json", "User-Agent": "skill-tokenized-agents/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    if (res.status === 202) {
      await new Promise((r) => setTimeout(r, 2000));
      continue;
    }
    if (!res.ok) return null;
    return (await res.json()) as GhParticipation;
  }
  return null;
}

export async function deliverChainDev(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  if (_chainDevCache && Date.now() < _chainDevCache.expires) {
    const d = _chainDevCache.data;
    const top = d.chains[0];
    const result = top
      ? `${top.chain} most active: ${top.commits_4w} commits/4w · ${d.chains.length} chains tracked`
      : "Developer activity cached";
    return { service_type: "chain-dev", result, chain_dev: d, timestamp, delivered_to };
  }

  const entries: ChainDevEntry[] = [];

  for (const { chain, repo } of CHAIN_DEV_REPOS) {
    try {
      // Small gap between requests to be polite to GitHub rate limiter
      if (entries.length > 0) await new Promise((r) => setTimeout(r, 300));
      const data = await fetchGhParticipation(repo);
      if (!data || data.all.length < 13) continue;

      const weeks = data.all;
      const commits_4w = weeks.slice(-4).reduce((s, n) => s + n, 0);
      const prev_4w  = weeks.slice(-8, -4).reduce((s, n) => s + n, 0);
      const commits_13w = weeks.slice(-13).reduce((s, n) => s + n, 0);
      const trend_pct = prev_4w > 0
        ? parseFloat((((commits_4w - prev_4w) / prev_4w) * 100).toFixed(1))
        : 0;

      entries.push({
        chain,
        repo,
        commits_4w,
        commits_13w,
        trend_pct,
        activity_level: devActivityLevel(commits_4w),
      });
    } catch {
      // Skip this chain if fetch fails
    }
  }

  if (entries.length === 0) {
    return { service_type: "chain-dev", result: "Developer activity data temporarily unavailable", timestamp, delivered_to };
  }

  entries.sort((a, b) => b.commits_4w - a.commits_4w);

  const chain_dev: ChainDevData = {
    chains: entries,
    fetched_at: timestamp,
    period_note: "Last 4 weeks vs prior 4 weeks",
  };
  _chainDevCache = { data: chain_dev, expires: Date.now() + CHAIN_DEV_TTL };

  const top = entries[0];
  const result = `${top.chain} most active: ${top.commits_4w} commits/4w · avg ${Math.round(entries.reduce((s, e) => s + e.commits_4w, 0) / entries.length)} commits/chain · ${entries.length} chains`;
  return { service_type: "chain-dev", result, chain_dev, timestamp, delivered_to };
}
