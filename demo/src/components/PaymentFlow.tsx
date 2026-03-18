"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Transaction } from "@solana/web3.js";
import type {
  ServiceType,
  ServiceResult,
  MarketData,
  SolanaStats,
  DefiPool,
  FearGreedEntry,
  FearGreedData,
  SolanaEcosystemData,
  AiModelsData,
  TrendingData,
  TopGainersData,
  DexVolumeData,
  PumpTokenData,
  PumpNewData,
  FundingRateData,
  BtcMempoolData,
  StablecoinData,
  SolTvlData,
  AiAgentTokensData,
  SolRevenueData,
  EthGasData,
  GlobalMarketData,
  L2TvlData,
  SolLstData,
  PolymarketData,
  NarrativeData,
  DefiFeesData,
  CexVolumeData,
  OptionsOIData,
  OptionsMaxPainData,
  BtcRainbowData,
  AltcoinSeasonData,
  BtcMiningData,
  BridgeVolumeData,
  TvlMoversData,
  LightningNetworkData,
  EthLstData,
  RealizedVolData,
  LendingRatesData,
  ProtocolRevenueData,
  BtcOnchainData,
  NftMarketData,
  NftCollectionEntry,
  MarketBreadthData,
  MarketBreadthEntry,
  PerpOIData,
  PerpExchangeEntry,
  StablecoinChainsData,
  StablecoinChainEntry,
} from "@/lib/services";

interface InvoiceParams {
  amount: string;
  memo: string;
  startTime: string;
  endTime: string;
}

type PaymentState =
  | { status: "idle" }
  | { status: "building" }
  | { status: "signing" }
  | { status: "confirming" }
  | { status: "verifying" }
  | { status: "success"; service: ServiceResult; signature: string }
  | { status: "error"; message: string };

type PreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; service: ServiceResult }
  | { status: "error"; message: string };

type X402DemoStep = "idle" | "step1_loading" | "step1_done" | "step2_loading" | "done" | "error";
interface X402DemoState {
  step: X402DemoStep;
  response402?: Record<string, unknown>;
  data?: ServiceResult;
  error?: string;
}

interface HealthStatus {
  ready: boolean;
  issues: string[];
}

type ServiceCategory = "All" | "Solana" | "Pump.fun" | "Market Data" | "DeFi" | "AI & Tech";

const SERVICE_CATEGORIES: ServiceCategory[] = ["All", "Solana", "Pump.fun", "Market Data", "DeFi", "AI & Tech"];

const SERVICE_OPTIONS: { id: ServiceType; label: string; description: string; price: string; category: ServiceCategory }[] = [
  {
    id: "crypto-prices",
    label: "Crypto Market Prices",
    description: "Live BTC, ETH, and SOL prices with 24h change",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "solana-stats",
    label: "Solana Network Stats",
    description: "Current TPS, slot, epoch, and validator count",
    price: "1 USDC",
    category: "Solana",
  },
  {
    id: "defi-yields",
    label: "Solana DeFi Yields",
    description: "Top Solana protocol APY rates by TVL (via DeFi Llama)",
    price: "1 USDC",
    category: "Solana",
  },
  {
    id: "fear-greed",
    label: "Crypto Sentiment",
    description: "Fear & Greed Index (0–100) with 7-day trend history",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "solana-ecosystem",
    label: "Solana Ecosystem Tokens",
    description: "Live prices for JUP, RAY, JTO, BONK, WIF, PYTH, ORCA with 24h change",
    price: "1 USDC",
    category: "Solana",
  },
  {
    id: "ai-models",
    label: "Top AI Models",
    description: "Most-liked AI language models on Hugging Face — DeepSeek, Llama, GPT, and more",
    price: "1 USDC",
    category: "AI & Tech",
  },
  {
    id: "trending-coins",
    label: "Trending Coins",
    description: "Top 7 most-searched coins on CoinGecko right now with price and 24h change",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "top-gainers",
    label: "Top Gainers",
    description: "Biggest 24h price movers across crypto with >$1M daily volume",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "dex-volume",
    label: "Solana DEX Volume Leaders",
    description: "Top Solana DEXes by 24h trading volume — PumpSwap, Raydium, Orca, and more",
    price: "1 USDC",
    category: "Solana",
  },
  {
    id: "pumpfun-tokens",
    label: "Pump.fun Hot Tokens",
    description: "Top tokens by 24h trading volume on PumpSwap — live from DexScreener",
    price: "1 USDC",
    category: "Pump.fun",
  },
  {
    id: "pump-new",
    label: "Pump.fun New Launches",
    description: "Most recently launched tokens on pump.fun — freshest additions with early momentum data",
    price: "1 USDC",
    category: "Pump.fun",
  },
  {
    id: "funding-rates",
    label: "Perp Funding Rates",
    description: "Live 8h funding rates for major perpetuals on Hyperliquid — bullish/bearish positioning signal",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "btc-mempool",
    label: "Bitcoin Mempool",
    description: "Live Bitcoin network congestion — pending tx count, mempool size, and fee rates from mempool.space",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "stablecoins",
    label: "Stablecoin Supply",
    description: "Top stablecoins by circulating supply — USDT, USDC, DAI, USDe and more with 24h mint/burn trends",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "sol-protocol-tvl",
    label: "Solana DeFi TVL",
    description: "Top Solana-native DeFi protocols ranked by total value locked — lending, staking, DEXs, and more",
    price: "1 USDC",
    category: "Solana",
  },
  {
    id: "ai-agent-tokens",
    label: "AI Agent Tokens",
    description: "Top AI agent economy tokens by market cap — VIRTUAL, FET, ai16z, Venice, and more from CoinGecko",
    price: "1 USDC",
    category: "AI & Tech",
  },
  {
    id: "sol-revenue",
    label: "Solana Protocol Revenue",
    description: "Top Solana protocols ranked by 24h fee revenue — PumpSwap, pump.fun, Jupiter Perps, and more",
    price: "1 USDC",
    category: "Solana",
  },
  {
    id: "eth-gas",
    label: "Ethereum Gas Tracker",
    description: "Real-time Ethereum gas prices across speed tiers — estimated cost to transfer ETH in USD",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "global-market",
    label: "Global Crypto Market",
    description: "Total crypto market cap, BTC & ETH dominance, 24h volume, DeFi size — the macro pulse in one glance",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "l2-tvl",
    label: "L2 Chain TVL Rankings",
    description: "Top Ethereum Layer 2 chains ranked by total value locked — Arbitrum, Base, Optimism, zkSync, Starknet and more",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "sol-lst",
    label: "Solana Liquid Staking Yields",
    description: "Top Solana liquid staking tokens (jitoSOL, mSOL, jupSOL, bSOL and more) with current APY and TVL — via DeFi Llama",
    price: "1 USDC",
    category: "Solana",
  },
  {
    id: "polymarket",
    label: "Polymarket Top Markets",
    description: "Top prediction markets by 24h trading volume — live event probabilities and market activity on Polymarket",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "narratives",
    label: "Crypto Narrative Performance",
    description: "Top crypto categories/narratives ranked by 24h market cap change — see which sectors are leading or lagging",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "defi-fees",
    label: "DeFi Protocol Fee Rankings",
    description: "Top DeFi protocols ranked by 30-day fees collected — see which protocols are generating the most on-chain revenue",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "cex-volume",
    label: "CEX Volume Rankings",
    description: "Top 10 centralized exchanges ranked by 24h spot trading volume — Binance, Coinbase, Kraken and more with trust scores",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "options-oi",
    label: "Crypto Options Open Interest",
    description: "BTC and ETH options open interest, put/call ratios, and top expiry concentration — live from Deribit, the #1 crypto options exchange",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "options-max-pain",
    label: "Options Max Pain",
    description: "BTC and ETH options max pain strike prices — the level where option buyers lose the most, live from Deribit for the dominant upcoming expiry",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "btc-rainbow",
    label: "BTC Rainbow Chart",
    description: "Bitcoin's current price vs its long-run power-law model — shows which rainbow band BTC is in from 'Fire Sale' to 'Maximum Bubble Territory'",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "altcoin-season",
    label: "Altcoin Season Index",
    description: "Are we in altcoin season or bitcoin season? Scores 0–100 based on how many of the top 50 coins outperformed BTC over the last 30 days",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "btc-mining",
    label: "BTC Mining Stats",
    description: "Bitcoin network health at a glance — current hashrate, average block time, and the expected difficulty adjustment at the next retarget",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "bridge-volume",
    label: "Cross-Chain Bridge Volume",
    description: "Top 10 cross-chain bridges ranked by 24h transfer volume — LayerZero, Circle CCTP, Wormhole, and more. Shows 7d volume and chain coverage",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "tvl-movers",
    label: "DeFi TVL Movers",
    description: "Top 5 DeFi protocols gaining and losing TVL over the past 7 days — spot emerging trends and capital rotation across protocols",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "lightning-network",
    label: "Lightning Network Stats",
    description: "Bitcoin Lightning Network health — channel count, node count, total locked BTC liquidity, and week-over-week growth. Via mempool.space",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "eth-lst",
    label: "Ethereum Liquid Staking Yields",
    description: "Top Ethereum liquid staking tokens (stETH, rETH, cbETH, mETH and more) with current APY and TVL — via DeFi Llama",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "realized-vol",
    label: "Crypto Realized Volatility",
    description: "Annualized 30d and 7d realized volatility for BTC, ETH, and SOL — spot regime shifts between high and low volatility markets",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "lending-rates",
    label: "EVM Lending Rates",
    description: "Best supply rates for USDC, USDT, ETH, and more across Aave v3, Compound v3, Maple, and other top EVM lending protocols — via DeFi Llama",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "protocol-revenue",
    label: "DeFi Protocol Revenue",
    description: "Top DeFi protocols ranked by actual revenue kept — the share of fees flowing to treasuries and token holders. Distinct from total fees charged to users.",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "btc-onchain",
    label: "Bitcoin On-Chain Activity",
    description: "24h Bitcoin transaction count, USD transfer volume, blocks mined, and miner revenue — fundamental network health metrics from blockchain.com",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "nft-market",
    label: "NFT Market Snapshot",
    description: "Top blue-chip NFT collections ranked by 24h volume — floor price in ETH and USD, 24h volume, and price change for Pudgy Penguins, BAYC, CryptoPunks, Azuki, Milady, and MAYC.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "market-breadth",
    label: "Crypto Market Breadth",
    description: "Advance/decline ratio for top 100 coins — how many are up vs down today, breadth score 0-100, top 5 gainers and top 5 losers by 24h % change.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "perp-oi",
    label: "Perp Exchange Open Interest",
    description: "Top crypto derivatives exchanges ranked by open interest — BTC-equivalent OI converted to USD, 24h trading volume, and perpetual pair count. Covers Binance, Bybit, OKX, Hyperliquid, and more.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "stablecoin-chains",
    label: "Stablecoin Chain Distribution",
    description: "Where stablecoins live — top blockchains ranked by total stablecoin TVL (USDT, USDC, DAI, etc.). Shows capital distribution across Ethereum, Tron, Solana, BSC, Base, and more.",
    price: "1 USDC",
    category: "Market Data",
  },
];

/**
 * Fallback mock data for the tour — used only when live /api/preview fetch fails.
 * These values reflect approximate real-world data as of early 2026; the tour
 * will prefer live-fetched data whenever the server is reachable.
 */
const MOCK_MARKET_DATA: MarketData[] = [
  { symbol: "BTC", price_usd: 71000, change_24h_pct: -0.8 },
  { symbol: "ETH", price_usd: 2080, change_24h_pct: -1.3 },
  { symbol: "SOL", price_usd: 87, change_24h_pct: -2.0 },
];

const MOCK_SOLANA_STATS: SolanaStats = {
  tps: 3200,
  slot: 406_000_000,
  validator_count: 780,
  epoch: 940,
};

const MOCK_DEFI_POOLS: DefiPool[] = [
  { protocol: "doublezero-staked-sol", symbol: "DZSOL", apy: 5.48, tvl_usd: 1_186_900_000 },
  { protocol: "jito-liquid-staking", symbol: "JITOSOL", apy: 5.94, tvl_usd: 1_126_700_000 },
  { protocol: "binance-staked-sol", symbol: "BNSOL", apy: 5.86, tvl_usd: 834_900_000 },
  { protocol: "jupiter-lend", symbol: "USDC", apy: 3.33, tvl_usd: 524_400_000 },
  { protocol: "jupiter-staked-sol", symbol: "JUPSOL", apy: 6.42, tvl_usd: 383_000_000 },
  { protocol: "marinade-liquid-staking", symbol: "MSOL", apy: 7.07, tvl_usd: 250_800_000 },
  { protocol: "drift-staked-sol", symbol: "DSOL", apy: 6.50, tvl_usd: 230_700_000 },
  { protocol: "kamino-lend", symbol: "JITOSOL", apy: 0.0, tvl_usd: 215_600_000 },
];

/** Generates 7-day history ending today with plausible extreme-fear values. */
function buildMockFearGreedHistory(): FearGreedEntry[] {
  const values = [16, 18, 21, 25, 19, 22, 17];
  return values.map((v, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const classification = v <= 24 ? "Extreme Fear" : v <= 44 ? "Fear" : "Neutral";
    return { date: label, value: v, classification };
  });
}

const MOCK_FEAR_GREED: FearGreedData = {
  current_value: 16,
  classification: "Extreme Fear",
  history: buildMockFearGreedHistory(),
};

const MOCK_SOLANA_ECOSYSTEM: SolanaEcosystemData = {
  tokens: [
    { symbol: "JUP", name: "Jupiter", price_usd: 0.159, change_24h_pct: -4.0, market_cap_usd: 556_000_000 },
    { symbol: "RAY", name: "Raydium", price_usd: 0.601, change_24h_pct: -1.9, market_cap_usd: 161_000_000 },
    { symbol: "JTO", name: "Jito", price_usd: 0.278, change_24h_pct: -2.6, market_cap_usd: 125_000_000 },
    { symbol: "BONK", name: "Bonk", price_usd: 0.00000598, change_24h_pct: -3.4, market_cap_usd: 526_000_000 },
    { symbol: "WIF", name: "dogwifhat", price_usd: 0.165, change_24h_pct: -2.4, market_cap_usd: 165_000_000 },
    { symbol: "PYTH", name: "Pyth", price_usd: 0.049, change_24h_pct: 0.7, market_cap_usd: 282_000_000 },
    { symbol: "ORCA", name: "Orca", price_usd: 0.21, change_24h_pct: -1.6, market_cap_usd: 54_000_000 },
  ],
};

const MOCK_AI_MODELS: AiModelsData = {
  models: [
    { id: "deepseek-ai/DeepSeek-R1", displayName: "deepseek-ai/DeepSeek-R1", downloads: 1327951, likes: 13127 },
    { id: "meta-llama/Meta-Llama-3-8B", displayName: "meta-llama/Meta-Llama-3-8B", downloads: 3118583, likes: 6486 },
    { id: "meta-llama/Llama-3.1-8B-Instruct", displayName: "meta-llama/Llama-3.1-8B-Instruct", downloads: 7330336, likes: 5564 },
    { id: "bigscience/bloom", displayName: "bigscience/bloom", downloads: 7266, likes: 4989 },
    { id: "openai/gpt-oss-120b", displayName: "openai/gpt-oss-120b", downloads: 4751810, likes: 4573 },
    { id: "meta-llama/Llama-2-7b-chat-hf", displayName: "meta-llama/Llama-2-7b-chat-hf", downloads: 358994, likes: 4723 },
    { id: "openai/gpt-oss-20b", displayName: "openai/gpt-oss-20b", downloads: 7465884, likes: 4455 },
    { id: "google/gemma-2-2b-it", displayName: "google/gemma-2-2b-it", downloads: 1854321, likes: 3891 },
  ],
};

const MOCK_TRENDING: TrendingData = {
  coins: [
    { id: "neiro-3", name: "Neiro", symbol: "NEIRO", market_cap_rank: 651, price_usd: 0.0000691, change_24h_pct: -1.1, market_cap: "$6.3M" },
    { id: "pi-network", name: "Pi Network", symbol: "PI", market_cap_rank: 20, price_usd: 0.202, change_24h_pct: -6.6, market_cap: "$1.3B" },
    { id: "pudgy-penguins", name: "Pudgy Penguins", symbol: "PENGU", market_cap_rank: 95, price_usd: 0.00726, change_24h_pct: 0.03, market_cap: "$477M" },
    { id: "ethereum", name: "Ethereum", symbol: "ETH", market_cap_rank: 2, price_usd: 2092, change_24h_pct: 0.04, market_cap: "$252B" },
    { id: "bittensor", name: "Bittensor", symbol: "TAO", market_cap_rank: 34, price_usd: 247, change_24h_pct: 4.2, market_cap: "$1.7B" },
    { id: "solana", name: "Solana", symbol: "SOL", market_cap_rank: 6, price_usd: 127, change_24h_pct: -1.8, market_cap: "$66B" },
    { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", market_cap_rank: 8, price_usd: 0.157, change_24h_pct: -2.4, market_cap: "$23B" },
  ],
};

const MOCK_TOP_GAINERS: TopGainersData = {
  gainers: [
    { symbol: "MNT", name: "Mantle", price_usd: 0.797, change_24h_pct: 11.5, volume_24h: 95_600_000, market_cap: 1_200_000_000 },
    { symbol: "TAO", name: "Bittensor", price_usd: 249.37, change_24h_pct: 8.2, volume_24h: 203_400_000, market_cap: 1_700_000_000 },
    { symbol: "INJ", name: "Injective", price_usd: 14.82, change_24h_pct: 7.6, volume_24h: 87_300_000, market_cap: 1_400_000_000 },
    { symbol: "HYPE", name: "Hyperliquid", price_usd: 18.45, change_24h_pct: 6.9, volume_24h: 143_200_000, market_cap: 3_600_000_000 },
    { symbol: "JTO", name: "Jito", price_usd: 2.51, change_24h_pct: 6.1, volume_24h: 52_100_000, market_cap: 630_000_000 },
    { symbol: "BONK", name: "Bonk", price_usd: 0.0000152, change_24h_pct: 5.8, volume_24h: 118_700_000, market_cap: 1_100_000_000 },
  ],
};

const MOCK_DEX_VOLUME: DexVolumeData = {
  dexes: [
    { name: "PumpSwap", chains: ["Solana"], volume_24h: 737530914, volume_7d: 4200000000, change_1d: 12.5 },
    { name: "Raydium AMM", chains: ["Solana"], volume_24h: 147933941, volume_7d: 980000000, change_1d: -3.2 },
    { name: "Meteora DLMM", chains: ["Solana"], volume_24h: 137050558, volume_7d: 850000000, change_1d: 8.1 },
    { name: "Orca DEX", chains: ["Solana", "Eclipse"], volume_24h: 88362624, volume_7d: 620000000, change_1d: -1.5 },
    { name: "Phoenix", chains: ["Solana"], volume_24h: 45000000, volume_7d: 290000000, change_1d: 5.3 },
  ],
};

const MOCK_PUMPFUN_TOKENS: PumpTokenData = {
  tokens: [
    { symbol: "MEMECARD", name: "MEMECARD", price_usd: 0.000918, change_24h_pct: -17.8, volume_24h: 9_814_035, market_cap: 918_302, address: "ACc3ZBq1c9h7pofwn2J8b8bvRHvqMFwynVg8neLZpump" },
    { symbol: "GOAT", name: "Goatseus Maximus", price_usd: 0.0412, change_24h_pct: 34.2, volume_24h: 7_340_000, market_cap: 41_200_000, address: "CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump" },
    { symbol: "FWOG", name: "FWOG", price_usd: 0.00714, change_24h_pct: -5.3, volume_24h: 5_120_000, market_cap: 7_140_000, address: "A8C3XmzFpump" },
    { symbol: "PONKE", name: "PONKE", price_usd: 0.0283, change_24h_pct: 12.7, volume_24h: 3_890_000, market_cap: 28_300_000, address: "5z3EqYQo9HiCnPNHatpump" },
    { symbol: "POPCAT", name: "Popcat", price_usd: 0.097, change_24h_pct: -2.1, volume_24h: 2_740_000, market_cap: 97_000_000, address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr" },
    { symbol: "WIF", name: "dogwifhat", price_usd: 0.165, change_24h_pct: -2.4, volume_24h: 2_100_000, market_cap: 165_000_000, address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm" },
  ],
};

const MOCK_PUMP_NEW: PumpNewData = {
  tokens: [
    { symbol: "DOGE2", name: "Doge 2.0", price_usd: 0.0000942, change_24h_pct: 371, volume_24h: 477_776, market_cap: 94_200, address: "AbcXyZ1234567890abcdefghijklmnopqrstuvwxpump", pair_created_at: Date.now() - 25 * 60_000 },
    { symbol: "BRAINROT", name: "BrainRot", price_usd: 0.00006201, change_24h_pct: 161, volume_24h: 601_119, market_cap: 62_010, address: "BcdYzA2345678901bcdefghijklmnopqrstuvwxypump", pair_created_at: Date.now() - 2 * 3_600_000 },
    { symbol: "INCOME", name: "Universal High Income", price_usd: 0.0001154, change_24h_pct: 217, volume_24h: 1_556_600, market_cap: 115_400, address: "CdeZaB3456789012cdefghijklmnopqrstuvwxyzpump", pair_created_at: Date.now() - 5 * 3_600_000 },
    { symbol: "MOGGED", name: "MOGGED", price_usd: 0.0002017, change_24h_pct: 461, volume_24h: 1_794_778, market_cap: 201_768, address: "DefAbC4567890123defghijklmnopqrstuvwxyzapump", pair_created_at: Date.now() - 8 * 3_600_000 },
    { symbol: "AMBALABU", name: "Boneca Ambalabu", price_usd: 0.0001095, change_24h_pct: 209, volume_24h: 606_381, market_cap: 109_542, address: "EfgBcD5678901234efghijklmnopqrstuvwxyzabpump", pair_created_at: Date.now() - 10 * 3_600_000 },
    { symbol: "MOLLY", name: "The Immortal Fish", price_usd: 0.0001429, change_24h_pct: 295, volume_24h: 1_023_596, market_cap: 142_958, address: "FghCdE6789012345fghijklmnopqrstuvwxyzabcpump", pair_created_at: Date.now() - 13 * 3_600_000 },
  ],
};

const MOCK_FUNDING_RATES: FundingRateData = {
  rates: [
    { symbol: "BTC", rate_8h: 0.0001, mark_price: 67890, open_interest: 245_000_000 },
    { symbol: "ETH", rate_8h: 0.00008, mark_price: 2080, open_interest: 98_000_000 },
    { symbol: "SOL", rate_8h: -0.00003, mark_price: 87, open_interest: 32_000_000 },
    { symbol: "BNB", rate_8h: 0.00005, mark_price: 412, open_interest: 18_000_000 },
    { symbol: "DOGE", rate_8h: 0.00012, mark_price: 0.157, open_interest: 22_000_000 },
    { symbol: "AVAX", rate_8h: -0.00002, mark_price: 21.4, open_interest: 8_000_000 },
    { symbol: "LINK", rate_8h: 0.00007, mark_price: 14.8, open_interest: 7_000_000 },
    { symbol: "SUI", rate_8h: 0.00015, mark_price: 2.91, open_interest: 15_000_000 },
  ],
};

const MOCK_BTC_MEMPOOL: BtcMempoolData = {
  count: 42_815,
  vsize_mb: 193.4,
  fee_fastest: 21,
  fee_30min: 14,
  fee_60min: 8,
};

const MOCK_STABLECOINS: StablecoinData = {
  coins: [
    { symbol: "USDT", name: "Tether", supply_usd: 144_000_000_000, change_24h_pct: 0.012, peg_mechanism: "fiat-backed" },
    { symbol: "USDC", name: "USD Coin", supply_usd: 56_000_000_000, change_24h_pct: -0.008, peg_mechanism: "fiat-backed" },
    { symbol: "USDe", name: "Ethena USDe", supply_usd: 5_600_000_000, change_24h_pct: 0.031, peg_mechanism: "crypto-backed" },
    { symbol: "DAI", name: "Dai", supply_usd: 5_200_000_000, change_24h_pct: -0.005, peg_mechanism: "crypto-backed" },
    { symbol: "USDS", name: "Sky Dollar", supply_usd: 3_400_000_000, change_24h_pct: 0.002, peg_mechanism: "crypto-backed" },
    { symbol: "FDUSD", name: "First Digital USD", supply_usd: 1_900_000_000, change_24h_pct: -0.021, peg_mechanism: "fiat-backed" },
  ],
  total_supply_usd: 216_100_000_000,
};

const MOCK_SOL_TVL: SolTvlData = {
  protocols: [
    { name: "Kamino Lend", category: "Lending", tvl_usd: 2_030_000_000, change_1d_pct: 0.68 },
    { name: "Jito Liquid Staking", category: "Liquid Staking", tvl_usd: 1_110_000_000, change_1d_pct: 0.62 },
    { name: "Raydium AMM", category: "Dexs", tvl_usd: 1_050_000_000, change_1d_pct: 1.30 },
    { name: "Jupiter Lend", category: "Lending", tvl_usd: 1_120_000_000, change_1d_pct: 0.44 },
    { name: "Jupiter Perpetual Exchange", category: "Derivatives", tvl_usd: 880_000_000, change_1d_pct: 0.69 },
    { name: "Sanctum Validator LSTs", category: "Liquid Staking", tvl_usd: 1_160_000_000, change_1d_pct: 0.74 },
    { name: "Marinade Finance", category: "Liquid Staking", tvl_usd: 320_000_000, change_1d_pct: 0.81 },
    { name: "Drift Protocol", category: "Derivatives", tvl_usd: 190_000_000, change_1d_pct: -1.20 },
  ],
  total_tvl_usd: 7_860_000_000,
};

const MOCK_AI_AGENT_TOKENS: AiAgentTokensData = {
  tokens: [
    { symbol: "VIRTUAL", name: "Virtuals Protocol", price_usd: 0.73, change_24h_pct: 3.15, market_cap_usd: 477_000_000, market_cap_rank: 98 },
    { symbol: "FET", name: "Fetch.ai", price_usd: 0.20, change_24h_pct: 13.66, market_cap_usd: 452_000_000, market_cap_rank: 101 },
    { symbol: "KITE", name: "ai16z Kite", price_usd: 0.22, change_24h_pct: -4.53, market_cap_usd: 395_000_000, market_cap_rank: 108 },
    { symbol: "VVV", name: "Venice Token", price_usd: 6.22, change_24h_pct: -4.25, market_cap_usd: 277_000_000, market_cap_rank: 121 },
    { symbol: "TRAC", name: "OriginTrail", price_usd: 0.32, change_24h_pct: 1.63, market_cap_usd: 143_000_000, market_cap_rank: 155 },
    { symbol: "AWE", name: "Agent World Engine", price_usd: 0.053, change_24h_pct: 1.33, market_cap_usd: 102_000_000, market_cap_rank: 187 },
    { symbol: "FAI", name: "Freysa AI", price_usd: 0.0068, change_24h_pct: -0.24, market_cap_usd: 55_800_000, market_cap_rank: 232 },
    { symbol: "PIPPIN", name: "Pippin", price_usd: 0.36, change_24h_pct: -2.32, market_cap_usd: 364_000_000, market_cap_rank: 110 },
  ],
};

const MOCK_SOL_REVENUE: SolRevenueData = {
  protocols: [
    { name: "PumpSwap", category: "Dexs", revenue_24h: 1_745_079, revenue_7d: 12_005_125 },
    { name: "pump.fun", category: "Launchpad", revenue_24h: 758_906, revenue_7d: 5_911_285 },
    { name: "Jupiter Perpetual Exchange", category: "Derivatives", revenue_24h: 376_925, revenue_7d: 7_766_482 },
    { name: "Axiom", category: "Trading App", revenue_24h: 345_705, revenue_7d: 1_963_415 },
    { name: "GMGN", category: "Telegram Bot", revenue_24h: 277_575, revenue_7d: 2_087_814 },
    { name: "Meteora DLMM", category: "Dexs", revenue_24h: 196_627, revenue_7d: 2_356_395 },
    { name: "Phantom Wallet", category: "Wallets", revenue_24h: 155_694, revenue_7d: 1_434_864 },
    { name: "Kamino Lend", category: "Lending", revenue_24h: 148_353, revenue_7d: 967_493 },
  ],
  total_revenue_24h: 4_005_864,
};

const MOCK_ETH_GAS: EthGasData = {
  base_fee_gwei: 0.17,
  eth_price_usd: 2100,
  levels: [
    { label: "Slow",     gwei: 0.188, wait: "~5+ min",  cost_usd: 0.00829 },
    { label: "Standard", gwei: 0.221, wait: "~1–3 min", cost_usd: 0.00975 },
    { label: "Fast",     gwei: 0.289, wait: "~30s",     cost_usd: 0.01274 },
    { label: "Rapid",    gwei: 2.144, wait: "~15s",     cost_usd: 0.09453 },
  ],
};

const MOCK_GLOBAL_MARKET: GlobalMarketData = {
  total_market_cap_usd: 2_560_000_000_000,
  total_volume_24h_usd: 77_600_000_000,
  market_cap_change_24h_pct: 2.34,
  btc_dominance: 56.9,
  eth_dominance: 10.8,
  active_cryptos: 17_200,
  defi_market_cap_usd: 96_000_000_000,
  stablecoin_volume_24h_usd: 40_000_000_000,
};

const MOCK_L2_TVL: L2TvlData = {
  chains: [
    { name: "Arbitrum", tvl_usd: 2_066_000_000, change_1d_pct: 1.2 },
    { name: "Base", tvl_usd: 4_230_000_000, change_1d_pct: 2.8 },
    { name: "Optimism", tvl_usd: 213_000_000, change_1d_pct: -0.5 },
    { name: "Starknet", tvl_usd: 267_000_000, change_1d_pct: 3.1 },
    { name: "Scroll", tvl_usd: 201_000_000, change_1d_pct: 0.9 },
    { name: "Linea", tvl_usd: 99_000_000, change_1d_pct: -1.2 },
    { name: "zkSync Era", tvl_usd: 64_000_000, change_1d_pct: 0.4 },
    { name: "Blast", tvl_usd: 35_000_000, change_1d_pct: -0.8 },
  ],
  total_tvl_usd: 7_175_000_000,
};

const MOCK_SOL_LST: SolLstData = {
  tokens: [
    { symbol: "JITOSOL", project: "Jito Liquid Staking", apy: 5.91, tvl_usd: 1_187_000_000 },
    { symbol: "JUPSOL", project: "Jupiter Staked Sol", apy: 6.35, tvl_usd: 403_000_000 },
    { symbol: "MSOL", project: "Marinade Liquid Staking", apy: 7.03, tvl_usd: 264_000_000 },
    { symbol: "DSOL", project: "Drift Staked Sol", apy: 6.53, tvl_usd: 247_000_000 },
    { symbol: "PSOL", project: "Phantom Sol", apy: 6.68, tvl_usd: 127_000_000 },
    { symbol: "BSOL", project: "Blazestake", apy: 5.56, tvl_usd: 96_000_000 },
    { symbol: "JSOL", project: "Jpool", apy: 5.60, tvl_usd: 117_000_000 },
    { symbol: "VSOL", project: "The Vault Liquid Staking", apy: 5.64, tvl_usd: 117_000_000 },
  ],
  avg_apy: 6.16,
};

const MOCK_ETH_LST: EthLstData = {
  tokens: [
    { symbol: "STETH", project: "Lido", apy: 2.41, tvl_usd: 21_419_000_000 },
    { symbol: "RETH", project: "Rocket Pool", apy: 1.97, tvl_usd: 3_140_000_000 },
    { symbol: "CBETH", project: "Coinbase Wrapped Staked Eth", apy: 2.84, tvl_usd: 279_000_000 },
    { symbol: "ETHX", project: "Stader", apy: 8.06, tvl_usd: 304_000_000 },
    { symbol: "SFRXETH", project: "Frax Ether", apy: 3.15, tvl_usd: 100_000_000 },
    { symbol: "OETH", project: "Origin Ether", apy: 2.46, tvl_usd: 100_000_000 },
    { symbol: "SWETH", project: "Swell Liquid Staking", apy: 2.70, tvl_usd: 47_000_000 },
  ],
  avg_apy: 3.37,
};

const MOCK_POLYMARKET: PolymarketData = {
  markets: [
    { question: "Will the Fed cut rates in March 2026?", outcomes: ["Yes", "No"], prices: [0.042, 0.958], volume_24h: 4_200_000 },
    { question: "Will Trump sign an executive order on crypto?", outcomes: ["Yes", "No"], prices: [0.71, 0.29], volume_24h: 2_800_000 },
    { question: "Will BTC reach $120K before May 2026?", outcomes: ["Yes", "No"], prices: [0.38, 0.62], volume_24h: 1_950_000 },
    { question: "Will US CPI stay below 3% in April?", outcomes: ["Yes", "No"], prices: [0.55, 0.45], volume_24h: 1_600_000 },
    { question: "Will Ethereum ETF flows turn positive in Q2?", outcomes: ["Yes", "No"], prices: [0.62, 0.38], volume_24h: 1_100_000 },
  ],
  total_volume_24h: 11_650_000,
};

const MOCK_NARRATIVES: NarrativeData = {
  narratives: [
    { name: "AI Agents", market_cap: 8_200_000_000, change_24h_pct: 9.4, volume_24h: 1_840_000_000, top_coins: ["Virtuals Protocol", "Fetch.Ai", "Bittensor"] },
    { name: "Meme Coins", market_cap: 51_000_000_000, change_24h_pct: 7.2, volume_24h: 12_400_000_000, top_coins: ["Dogecoin", "Shiba Inu", "Pepe"] },
    { name: "DeFi", market_cap: 74_000_000_000, change_24h_pct: 5.1, volume_24h: 18_300_000_000, top_coins: ["Uniswap", "Aave", "Chainlink"] },
    { name: "Layer 2 (Ethereum)", market_cap: 22_000_000_000, change_24h_pct: 4.3, volume_24h: 5_200_000_000, top_coins: ["Arbitrum", "Optimism", "Polygon"] },
    { name: "Restaking", market_cap: 1_050_000_000, change_24h_pct: 7.0, volume_24h: 310_000_000, top_coins: ["Wrapped Eeth", "Kelp Dao", "Lombard"] },
    { name: "NFT", market_cap: 14_500_000_000, change_24h_pct: 2.8, volume_24h: 2_100_000_000, top_coins: ["Apecoin", "Pudgy Penguins", "Blur"] },
    { name: "GameFi", market_cap: 9_300_000_000, change_24h_pct: 1.5, volume_24h: 1_700_000_000, top_coins: ["Axie Infinity", "Gala", "Illuvium"] },
    { name: "Real World Assets", market_cap: 6_800_000_000, change_24h_pct: -0.9, volume_24h: 890_000_000, top_coins: ["Ondo Finance", "Centrifuge", "Goldfinch"] },
    { name: "Privacy Coins", market_cap: 8_100_000_000, change_24h_pct: -1.4, volume_24h: 980_000_000, top_coins: ["Monero", "Zcash", "Dash"] },
    { name: "Prediction Markets", market_cap: 4_500_000_000, change_24h_pct: -1.2, volume_24h: 720_000_000, top_coins: ["Polymarket", "Augur", "Gnosis"] },
  ],
};

const MOCK_DEFI_FEES: DefiFeesData = {
  entries: [
    { name: "Hyperliquid Perps", category: "Derivatives", total30d: 57_868_001, total24h: 2_150_000, change_1m: 12.4, chains: ["Hyperliquid L1"] },
    { name: "PumpSwap", category: "Dexs", total30d: 53_716_465, total24h: 1_745_000, change_1m: -8.2, chains: ["Solana"] },
    { name: "Aave V3", category: "Lending", total30d: 48_700_373, total24h: 1_580_000, change_1m: 5.7, chains: ["Ethereum", "OP Mainnet"] },
    { name: "Lido", category: "Liquid Staking", total30d: 41_421_658, total24h: 1_320_000, change_1m: 3.1, chains: ["Ethereum"] },
    { name: "Jupiter Perpetual Exchange", category: "Derivatives", total30d: 35_105_318, total24h: 1_100_000, change_1m: -4.5, chains: ["Solana"] },
    { name: "Sky Lending", category: "CDP", total30d: 34_502_886, total24h: 1_050_000, change_1m: 2.2, chains: ["Ethereum"] },
    { name: "Uniswap V3", category: "Dexs", total30d: 28_400_000, total24h: 920_000, change_1m: -1.8, chains: ["Ethereum", "Base"] },
    { name: "pump.fun", category: "Launchpad", total30d: 24_800_000, total24h: 758_000, change_1m: -22.0, chains: ["Solana"] },
    { name: "Kamino Lend", category: "Lending", total30d: 18_200_000, total24h: 560_000, change_1m: 6.3, chains: ["Solana"] },
    { name: "Raydium", category: "Dexs", total30d: 16_700_000, total24h: 510_000, change_1m: -9.1, chains: ["Solana"] },
  ],
};

const MOCK_PROTOCOL_REVENUE: ProtocolRevenueData = {
  entries: [
    { name: "Hyperliquid Perps", category: "Derivatives", revenue_30d: 38_500_000, revenue_24h: 1_430_000, change_1m: 15.2, chains: ["Hyperliquid L1"] },
    { name: "pump.fun", category: "Launchpad", revenue_30d: 24_800_000, revenue_24h: 758_000, change_1m: -22.0, chains: ["Solana"] },
    { name: "Aave V3", category: "Lending", revenue_30d: 9_740_000, revenue_24h: 316_000, change_1m: 5.7, chains: ["Ethereum", "OP Mainnet"] },
    { name: "Sky", category: "CDP", revenue_30d: 8_100_000, revenue_24h: 247_000, change_1m: 2.2, chains: ["Ethereum"] },
    { name: "Lido", category: "Liquid Staking", revenue_30d: 6_213_000, revenue_24h: 198_000, change_1m: 3.1, chains: ["Ethereum"] },
    { name: "Jupiter Perpetual Exchange", category: "Derivatives", revenue_30d: 5_265_000, revenue_24h: 165_000, change_1m: -4.5, chains: ["Solana"] },
    { name: "GMX", category: "Derivatives", revenue_30d: 4_820_000, revenue_24h: 147_000, change_1m: -11.3, chains: ["Arbitrum", "Avalanche"] },
    { name: "Uniswap V3", category: "Dexs", revenue_30d: 2_840_000, revenue_24h: 92_000, change_1m: -1.8, chains: ["Ethereum", "Base"] },
    { name: "dYdX v4", category: "Derivatives", revenue_30d: 2_250_000, revenue_24h: 68_000, change_1m: 8.4, chains: ["dYdX"] },
    { name: "Convex Finance", category: "Yield", revenue_30d: 1_980_000, revenue_24h: 60_000, change_1m: -6.2, chains: ["Ethereum"] },
  ],
};

const MOCK_CEX_VOLUME: CexVolumeData = {
  btc_price_usd: 82000,
  exchanges: [
    { rank: 1, name: "Binance", volume_btc_24h: 1_320_000, volume_usd_24h: 108_240_000_000, trust_score: 10, year_established: 2017, country: "Cayman Islands" },
    { rank: 2, name: "Bybit", volume_btc_24h: 420_000, volume_usd_24h: 34_440_000_000, trust_score: 10, year_established: 2018, country: "United Arab Emirates" },
    { rank: 3, name: "Coinbase Exchange", volume_btc_24h: 180_000, volume_usd_24h: 14_760_000_000, trust_score: 10, year_established: 2012, country: "United States" },
    { rank: 4, name: "OKX", volume_btc_24h: 160_000, volume_usd_24h: 13_120_000_000, trust_score: 10, year_established: 2017, country: "Seychelles" },
    { rank: 5, name: "Kraken", volume_btc_24h: 95_000, volume_usd_24h: 7_790_000_000, trust_score: 10, year_established: 2011, country: "United States" },
    { rank: 6, name: "Gate.io", volume_btc_24h: 88_000, volume_usd_24h: 7_216_000_000, trust_score: 9, year_established: 2013, country: "Cayman Islands" },
    { rank: 7, name: "Bitget", volume_btc_24h: 75_000, volume_usd_24h: 6_150_000_000, trust_score: 9, year_established: 2018, country: "Singapore" },
    { rank: 8, name: "HTX", volume_btc_24h: 62_000, volume_usd_24h: 5_084_000_000, trust_score: 8, year_established: 2013, country: "Seychelles" },
    { rank: 9, name: "KuCoin", volume_btc_24h: 55_000, volume_usd_24h: 4_510_000_000, trust_score: 8, year_established: 2017, country: "Seychelles" },
    { rank: 10, name: "MEXC", volume_btc_24h: 48_000, volume_usd_24h: 3_936_000_000, trust_score: 7, year_established: 2018, country: "Seychelles" },
  ],
};

const MOCK_OPTIONS_OI: OptionsOIData = {
  assets: [
    {
      asset: "BTC",
      price_usd: 82000,
      total_oi_usd: 28_700_000_000,
      call_oi_usd: 17_200_000_000,
      put_oi_usd: 11_500_000_000,
      put_call_ratio: 0.67,
      top_expiry: "28MAR25",
      top_expiry_oi_usd: 9_800_000_000,
    },
    {
      asset: "ETH",
      price_usd: 1980,
      total_oi_usd: 7_600_000_000,
      call_oi_usd: 4_400_000_000,
      put_oi_usd: 3_200_000_000,
      put_call_ratio: 0.73,
      top_expiry: "28MAR25",
      top_expiry_oi_usd: 2_100_000_000,
    },
  ],
};

const MOCK_OPTIONS_MAX_PAIN: OptionsMaxPainData = {
  assets: [
    {
      asset: "BTC",
      spot_usd: 82000,
      max_pain_strike: 80000,
      distance_pct: -2.4,
      direction: "below",
      expiry: "27MAR26",
      expiry_oi_contracts: 185000,
    },
    {
      asset: "ETH",
      spot_usd: 2000,
      max_pain_strike: 2200,
      distance_pct: 10.0,
      direction: "above",
      expiry: "27MAR26",
      expiry_oi_contracts: 950000,
    },
  ],
};

const MOCK_BTC_RAINBOW: BtcRainbowData = {
  current_price_usd: 83000,
  model_price_usd: 149000,
  ratio: 0.557,
  days_since_genesis: 6283,
  band: { index: 3, label: "Accumulate", color: "#00838f" },
  interpretation: "BTC is trading below trend — historically a good accumulation window.",
};

const MOCK_ALTCOIN_SEASON: AltcoinSeasonData = {
  score: 38,
  btc_change_30d_pct: 8.4,
  total_coins: 48,
  outperforming: 18,
  signal: "neutral",
  signal_label: "Mixed / Neutral ⚖️",
  top_performers: [
    { symbol: "SUI", name: "Sui", change_30d_pct: 42.1, outperformed_btc: true },
    { symbol: "SEI", name: "Sei", change_30d_pct: 38.7, outperformed_btc: true },
    { symbol: "TON", name: "Toncoin", change_30d_pct: 27.3, outperformed_btc: true },
    { symbol: "AVAX", name: "Avalanche", change_30d_pct: 19.5, outperformed_btc: true },
    { symbol: "LINK", name: "Chainlink", change_30d_pct: 14.2, outperformed_btc: true },
  ],
  bottom_performers: [
    { symbol: "ICP", name: "Internet Computer", change_30d_pct: -28.3, outperformed_btc: false },
    { symbol: "NEAR", name: "NEAR Protocol", change_30d_pct: -22.1, outperformed_btc: false },
    { symbol: "FIL", name: "Filecoin", change_30d_pct: -18.9, outperformed_btc: false },
    { symbol: "APT", name: "Aptos", change_30d_pct: -14.5, outperformed_btc: false },
    { symbol: "ATOM", name: "Cosmos", change_30d_pct: -11.2, outperformed_btc: false },
  ],
};

const MOCK_BTC_MINING: BtcMiningData = {
  hashrate_eh: 842.3,
  difficulty_change_pct: -3.2,
  progress_pct: 68.5,
  remaining_blocks: 634,
  estimated_retarget_date: new Date(Date.now() + 4.4 * 86400 * 1000).toISOString(),
  days_until_retarget: 4,
  prev_retarget_pct: 1.8,
  next_retarget_height: 941472,
  avg_block_time_sec: 624,
};

const MOCK_BRIDGE_VOLUME: BridgeVolumeData = {
  bridges: [
    { name: "LayerZero", volume_24h_usd: 323_135_309, volume_7d_usd: 2_110_634_587, chains: 114 },
    { name: "Circle CCTP", volume_24h_usd: 282_878_455, volume_7d_usd: 1_975_969_588, chains: 16 },
    { name: "USDT0", volume_24h_usd: 195_700_000, volume_7d_usd: 1_568_000_000, chains: 20 },
    { name: "Hyperliquid", volume_24h_usd: 90_000_000, volume_7d_usd: 439_000_000, chains: 2 },
    { name: "Wormhole", volume_24h_usd: 50_200_000, volume_7d_usd: 655_000_000, chains: 27 },
    { name: "Relay", volume_24h_usd: 41_400_000, volume_7d_usd: 329_000_000, chains: 44 },
    { name: "Chainlink CCIP", volume_24h_usd: 23_100_000, volume_7d_usd: 582_000_000, chains: 75 },
    { name: "Polygon PoS Bridge", volume_24h_usd: 16_400_000, volume_7d_usd: 70_000_000, chains: 2 },
    { name: "Hyperlane", volume_24h_usd: 16_000_000, volume_7d_usd: 0, chains: 66 },
    { name: "Stargate", volume_24h_usd: 14_300_000, volume_7d_usd: 95_000_000, chains: 18 },
  ],
  total_24h_usd: 1_380_000_000,
  total_7d_usd: 9_200_000_000,
};

const MOCK_TVL_MOVERS: TvlMoversData = {
  gainers: [
    { name: "Fluid", chain: "Ethereum", category: "Lending", tvl_usd: 1_820_000_000, change_7d_pct: 34.2 },
    { name: "Berachain", chain: "Berachain", category: "Dexes", tvl_usd: 3_100_000_000, change_7d_pct: 22.7 },
    { name: "Ethena", chain: "Multi-chain", category: "Yield", tvl_usd: 5_400_000_000, change_7d_pct: 18.3 },
    { name: "Resolv", chain: "Ethereum", category: "Yield", tvl_usd: 780_000_000, change_7d_pct: 15.1 },
    { name: "PancakeSwap", chain: "Multi-chain", category: "Dexes", tvl_usd: 2_300_000_000, change_7d_pct: 11.6 },
  ],
  losers: [
    { name: "Maker", chain: "Ethereum", category: "CDP", tvl_usd: 4_200_000_000, change_7d_pct: -18.4 },
    { name: "Convex Finance", chain: "Ethereum", category: "Yield", tvl_usd: 1_100_000_000, change_7d_pct: -14.2 },
    { name: "Stargate", chain: "Multi-chain", category: "Bridge", tvl_usd: 450_000_000, change_7d_pct: -11.8 },
    { name: "Frax Finance", chain: "Multi-chain", category: "CDP", tvl_usd: 680_000_000, change_7d_pct: -9.5 },
    { name: "SushiSwap", chain: "Multi-chain", category: "Dexes", tvl_usd: 230_000_000, change_7d_pct: -7.3 },
  ],
  total_defi_tvl: 88_700_000_000,
};

const MOCK_LIGHTNING_NETWORK: LightningNetworkData = {
  channel_count: 40683,
  node_count: 17376,
  total_capacity_btc: 4880.97,
  avg_channel_btc: 0.12,
  tor_nodes: 9047,
  avg_fee_rate: 798,
  channel_count_change: 230,
  node_count_change: 23,
  capacity_change_btc: 0.88,
};

const MOCK_REALIZED_VOL: RealizedVolData = {
  assets: [
    { symbol: "BTC", vol_30d_pct: 49.2, vol_7d_pct: 27.8, regime: "cooling" },
    { symbol: "ETH", vol_30d_pct: 68.4, vol_7d_pct: 45.1, regime: "cooling" },
    { symbol: "SOL", vol_30d_pct: 82.6, vol_7d_pct: 58.3, regime: "cooling" },
  ],
  market_regime: "cooling",
};

const MOCK_LENDING_RATES: LendingRatesData = {
  pools: [
    { protocol: "maple", chain: "Ethereum", symbol: "USDC", supply_apy: 4.35, tvl_usd: 3361000000 },
    { protocol: "maple", chain: "Ethereum", symbol: "USDT", supply_apy: 3.95, tvl_usd: 2070000000 },
    { protocol: "compound-v3", chain: "Ethereum", symbol: "USDC", supply_apy: 2.25, tvl_usd: 162000000 },
    { protocol: "compound-v3", chain: "Ethereum", symbol: "USDT", supply_apy: 2.16, tvl_usd: 80000000 },
    { protocol: "aave-v3", chain: "Ethereum", symbol: "USDT", supply_apy: 1.91, tvl_usd: 1548000000 },
    { protocol: "aave-v3", chain: "Ethereum", symbol: "USDC", supply_apy: 1.84, tvl_usd: 1162000000 },
    { protocol: "aave-v3", chain: "Ethereum", symbol: "WETH", supply_apy: 1.68, tvl_usd: 815000000 },
    { protocol: "aave-v3", chain: "Arbitrum", symbol: "WETH", supply_apy: 1.71, tvl_usd: 50000000 },
  ],
  best_stable_apy: 4.35,
  best_stable_protocol: "maple USDC",
  best_eth_apy: 1.71,
  best_eth_protocol: "aave-v3 (Arbitrum)",
};

const MOCK_BTC_ONCHAIN: BtcOnchainData = {
  tx_count_24h: 412_583,
  tx_volume_usd: 31_400_000_000,
  tx_volume_btc: 374_200,
  blocks_mined_24h: 144,
  subsidy_revenue_usd: 33_600_000,
  avg_tx_value_usd: 76_100,
};

const MOCK_NFT_MARKET: NftMarketData = {
  collections: [
    { name: "Pudgy Penguins", symbol: "PPG", floor_price_usd: 9800, floor_price_eth: 4.2, volume_24h_usd: 82000, volume_24h_eth: 35.1, market_cap_usd: 87_000_000, change_24h_pct: 1.2, market_cap_rank: 3 },
    { name: "Bored Ape Yacht Club", symbol: "BAYC", floor_price_usd: 62000, floor_price_eth: 26.5, volume_24h_usd: 68000, volume_24h_eth: 29.0, market_cap_usd: 551_000_000, change_24h_pct: -2.1, market_cap_rank: 1 },
    { name: "CryptoPunks", symbol: "PUNK", floor_price_usd: 89000, floor_price_eth: 38.0, volume_24h_usd: 54000, volume_24h_eth: 23.0, market_cap_usd: 890_000_000, change_24h_pct: 0.5, market_cap_rank: 2 },
    { name: "Azuki", symbol: "AZUKI", floor_price_usd: 4300, floor_price_eth: 1.84, volume_24h_usd: 41000, volume_24h_eth: 17.5, market_cap_usd: 43_000_000, change_24h_pct: -3.4, market_cap_rank: 6 },
    { name: "Milady Maker", symbol: "MILADY", floor_price_usd: 3200, floor_price_eth: 1.37, volume_24h_usd: 28000, volume_24h_eth: 12.0, market_cap_usd: 32_000_000, change_24h_pct: 4.7, market_cap_rank: 9 },
    { name: "Mutant Ape Yacht Club", symbol: "MAYC", floor_price_usd: 13500, floor_price_eth: 5.8, volume_24h_usd: 22000, volume_24h_eth: 9.4, market_cap_usd: 270_000_000, change_24h_pct: -1.5, market_cap_rank: 4 },
  ] as NftCollectionEntry[],
};

const MOCK_MARKET_BREADTH: MarketBreadthData = {
  advancing: 58,
  declining: 34,
  neutral: 8,
  total: 100,
  breadth_score: 58,
  top_gainers: [
    { symbol: "SUI", name: "Sui", change_24h_pct: 8.4 },
    { symbol: "SEI", name: "Sei", change_24h_pct: 6.1 },
    { symbol: "INJ", name: "Injective", change_24h_pct: 5.3 },
    { symbol: "TIA", name: "Celestia", change_24h_pct: 4.7 },
    { symbol: "APT", name: "Aptos", change_24h_pct: 4.2 },
  ] as MarketBreadthEntry[],
  top_losers: [
    { symbol: "RNDR", name: "Render", change_24h_pct: -4.8 },
    { symbol: "FET", name: "Fetch.ai", change_24h_pct: -4.1 },
    { symbol: "OCEAN", name: "Ocean Protocol", change_24h_pct: -3.9 },
    { symbol: "GRT", name: "The Graph", change_24h_pct: -3.4 },
    { symbol: "LPT", name: "Livepeer", change_24h_pct: -2.9 },
  ] as MarketBreadthEntry[],
};

const MOCK_PERP_OI: PerpOIData = {
  btc_price: 83500,
  total_oi_btc: 1_369_070,
  total_oi_usd: 114_317_345_000,
  exchanges: [
    { name: "Binance (Futures)", oi_btc: 326172, oi_usd: 27_235_362_000, vol_24h_btc: 612294, vol_24h_usd: 51_126_549_000, perp_pairs: 378 },
    { name: "Bybit (Futures)", oi_btc: 149829, oi_usd: 12_510_721_500, vol_24h_btc: 179576, vol_24h_usd: 14_994_596_000, perp_pairs: 321 },
    { name: "OKX (Futures)", oi_btc: 96714, oi_usd: 8_075_619_000, vol_24h_btc: 284246, vol_24h_usd: 23_734_541_000, perp_pairs: 267 },
    { name: "Gate (Futures)", oi_btc: 141786, oi_usd: 11_839_131_000, vol_24h_btc: 212131, vol_24h_usd: 17_713_438_500, perp_pairs: 415 },
    { name: "MEXC (Futures)", oi_btc: 111381, oi_usd: 9_300_313_500, vol_24h_btc: 139767, vol_24h_usd: 11_671_544_500, perp_pairs: 402 },
    { name: "Bitget Futures", oi_btc: 93675, oi_usd: 7_821_862_500, vol_24h_btc: 108697, vol_24h_usd: 9_076_199_500, perp_pairs: 319 },
    { name: "Hyperliquid (Futures)", oi_btc: 93371, oi_usd: 7_796_481_500, vol_24h_btc: 74482, vol_24h_usd: 6_219_247_000, perp_pairs: 122 },
    { name: "BYDFi (Futures)", oi_btc: 114569, oi_usd: 9_566_511_500, vol_24h_btc: 13866, vol_24h_usd: 1_157_811_000, perp_pairs: 187 },
    { name: "Bitmart Futures", oi_btc: 134965, oi_usd: 11_269_577_500, vol_24h_btc: 236580, vol_24h_usd: 19_754_430_000, perp_pairs: 280 },
    { name: "LBank (Futures)", oi_btc: 107589, oi_usd: 8_983_681_500, vol_24h_btc: 86498, vol_24h_usd: 7_222_583_000, perp_pairs: 234 },
  ] as PerpExchangeEntry[],
};

const MOCK_STABLECOIN_CHAINS: StablecoinChainsData = {
  total_usd: 336_400_000_000,
  top_chain: "Ethereum",
  top_chain_pct: 49.4,
  chains: [
    { name: "Ethereum", tvl_usd: 166_150_000_000, pct_of_total: 49.4 },
    { name: "Tron", tvl_usd: 84_840_000_000, pct_of_total: 25.2 },
    { name: "BSC", tvl_usd: 17_080_000_000, pct_of_total: 5.1 },
    { name: "Solana", tvl_usd: 15_780_000_000, pct_of_total: 4.7 },
    { name: "Hyperliquid L1", tvl_usd: 5_010_000_000, pct_of_total: 1.5 },
    { name: "Base", tvl_usd: 4_650_000_000, pct_of_total: 1.4 },
    { name: "Arbitrum", tvl_usd: 4_010_000_000, pct_of_total: 1.2 },
    { name: "Polygon", tvl_usd: 3_440_000_000, pct_of_total: 1.0 },
    { name: "Aptos", tvl_usd: 1_740_000_000, pct_of_total: 0.5 },
    { name: "Avalanche", tvl_usd: 1_720_000_000, pct_of_total: 0.5 },
    { name: "Plasma", tvl_usd: 1_650_000_000, pct_of_total: 0.5 },
    { name: "Mantle", tvl_usd: 800_000_000, pct_of_total: 0.2 },
  ] as StablecoinChainEntry[],
};

const MOCK_SIGNATURE =
  "5KtPn3...xR7qW2 (simulated — no real transaction in tour mode)";

// ---------------------------------------------------------------------------
// Developer code snippets — shown in the "Show code" panel during the tour
// ---------------------------------------------------------------------------
const CODE_SNIPPETS: Record<string, { title: string; code: string }> = {
  idle: {
    title: "SDK Setup",
    code: `import { PumpAgent } from "@pump-fun/agent-payments-sdk";
import { Connection, PublicKey } from "@solana/web3.js";

// Construct the agent once — it needs the mint address
// from your pump.fun token and a confirmed-commitment RPC.
const agentMint = new PublicKey(process.env.AGENT_TOKEN_MINT_ADDRESS!);
const connection = new Connection(
  process.env.SOLANA_RPC_URL!,
  "confirmed"
);
const agent = new PumpAgent(agentMint, "mainnet", connection);`,
  },
  building: {
    title: "Step 1 — Build Payment Transaction (server)",
    code: `// Server-side: build the unsigned accept-payment transaction.
// The server controls invoice params; the client only signs.
const invoiceParams = {
  amount: "1000000",           // 1 USDC (6 decimals)
  memo: String(randomMemo),    // unique per invoice
  startTime: String(now),
  endTime:   String(now + 86400),
};

const instructions = await agent.buildAcceptPaymentInstructions({
  user:         new PublicKey(userWallet),
  currencyMint: new PublicKey(process.env.CURRENCY_MINT!),
  amount:    invoiceParams.amount,
  memo:      invoiceParams.memo,
  startTime: invoiceParams.startTime,
  endTime:   invoiceParams.endTime,
});

const tx = new Transaction();
tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
tx.feePayer = new PublicKey(userWallet);
tx.add(...instructions);

// Serialize unsigned — the client signs with their wallet
const base64Tx = tx
  .serialize({ requireAllSignatures: false })
  .toString("base64");`,
  },
  signing: {
    title: "Step 2 — Sign & Submit (client)",
    code: `// Client-side: wallet adapter prompts user to approve the transaction.
// We NEVER touch the user's private key — the wallet signs.
const tx = Transaction.from(Buffer.from(base64Tx, "base64"));
const signedTx = await signTransaction(tx);   // wallet popup

// Submit to the network; returns a signature immediately
// (not yet confirmed — we wait in the next step).
const signature = await connection.sendRawTransaction(
  signedTx.serialize(),
  { skipPreflight: false, preflightCommitment: "confirmed" }
);`,
  },
  confirming: {
    title: "Step 3 — Await On-Chain Confirmation (client)",
    code: `// Wait until Solana validators confirm the transaction.
// This usually takes 5–30 seconds on mainnet.
const { blockhash, lastValidBlockHeight } =
  await connection.getLatestBlockhash("confirmed");

await connection.confirmTransaction(
  { signature, blockhash, lastValidBlockHeight },
  "confirmed"
);

// Transaction is finalized — safe to call the verify endpoint.`,
  },
  verifying: {
    title: "Step 4 — Server-Side Verification (server)",
    code: `// Server-side: verify the invoice was actually paid on-chain.
// NEVER trust the client — always check independently.
const paid = await agent.validateInvoicePayment({
  user:         new PublicKey(userWallet),
  currencyMint: new PublicKey(process.env.CURRENCY_MINT!),
  amount:    Number(invoiceParams.amount),
  memo:      Number(invoiceParams.memo),
  startTime: Number(invoiceParams.startTime),
  endTime:   Number(invoiceParams.endTime),
});

if (!paid) {
  // Payment not found on-chain → don't deliver the service
  return NextResponse.json({ paid: false }, { status: 402 });
}`,
  },
  success: {
    title: "Complete — Payment Verified ✓",
    code: `// validateInvoicePayment confirmed the on-chain Invoice ID PDA.
// Security guarantees:
//   ● Double-spend protection — PDA is initialized once per invoice.
//   ● Parameter integrity   — amount, memo, and time window must
//                             match exactly; no partial matches.
//   ● No client trust       — server always re-verifies independently.
//
// Now safe to deliver gated content and return it to the user.
return NextResponse.json({
  paid: true,
  signature,
  service: await deliverService(userWallet, serviceType),
});`,
  },
};

const SNIPPET_KEYS = ["idle", "building", "signing", "confirming", "verifying", "success"] as const;
const TAB_LABELS: Record<string, string> = {
  idle: "Setup",
  building: "Build",
  signing: "Sign",
  confirming: "Confirm",
  verifying: "Verify",
  success: "Complete",
};

function CodePanel({ status }: { status: string }) {
  const [activeTab, setActiveTab] = useState<string>(status in CODE_SNIPPETS ? status : "idle");
  const [copied, setCopied] = useState(false);

  // Follow the tour automatically when it advances
  useEffect(() => {
    if (status in CODE_SNIPPETS) {
      setActiveTab(status);
      setCopied(false);
    }
  }, [status]);

  const snippet = CODE_SNIPPETS[activeTab] ?? CODE_SNIPPETS.idle;

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ marginTop: 12, borderRadius: 6, overflow: "hidden", fontSize: 12, border: "1px solid #1e2a3a" }}>
      {/* Step tabs */}
      <div style={{ display: "flex", background: "#0a1018", borderBottom: "1px solid #1e2a3a", overflowX: "auto" }}>
        {SNIPPET_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => { setActiveTab(key); setCopied(false); }}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === key ? "2px solid #7eb8f7" : "2px solid transparent",
              color: activeTab === key ? "#7eb8f7" : "#4a6080",
              cursor: "pointer",
              fontSize: 10,
              fontWeight: activeTab === key ? 700 : 400,
              padding: "6px 12px",
              whiteSpace: "nowrap",
              transition: "color 0.15s",
              fontFamily: "inherit",
            }}
          >
            {TAB_LABELS[key]}
          </button>
        ))}
      </div>
      {/* Title + copy */}
      <div style={{
        background: "#1e2a3a",
        padding: "6px 12px",
        color: "#7eb8f7",
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: "0.02em",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>{snippet.title}</span>
        <button
          onClick={handleCopy}
          style={{
            background: "none",
            border: "1px solid #2e4060",
            borderRadius: 4,
            color: copied ? "#4ade80" : "#7eb8f7",
            cursor: "pointer",
            fontSize: 10,
            padding: "2px 8px",
            fontFamily: "inherit",
            transition: "color 0.2s",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre style={{
        margin: 0,
        padding: "12px 14px",
        background: "#0d1520",
        color: "#c8d8e8",
        overflowX: "auto",
        lineHeight: 1.6,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
      }}>
        {snippet.code}
      </pre>
    </div>
  );
}

/**
 * Interactive x402 HTTP Payment Protocol demo panel.
 * Shows the 3-step agent payment flow: request → 402 → pay → data delivered.
 */
function X402DemoPanel({
  selectedService,
  selectedLabel,
}: {
  selectedService: ServiceType;
  selectedLabel: string;
}) {
  const [state, setState] = useState<X402DemoState>({ step: "idle" });

  const runStep1 = async () => {
    setState({ step: "step1_loading" });
    try {
      const res = await fetch(`/api/x402-data?service=${selectedService}`);
      if (res.status === 402) {
        const data = (await res.json()) as Record<string, unknown>;
        setState({ step: "step1_done", response402: data });
      } else {
        setState({ step: "error", error: `Expected 402, got ${res.status}` });
      }
    } catch (err) {
      setState({ step: "error", error: err instanceof Error ? err.message : "Network error" });
    }
  };

  const runStep2 = async () => {
    setState((prev) => ({ ...prev, step: "step2_loading" }));
    try {
      const res = await fetch(`/api/x402-data?service=${selectedService}`, {
        headers: { "X-X402-Demo": "true" },
      });
      if (res.ok) {
        const data = (await res.json()) as ServiceResult;
        setState((prev) => ({ ...prev, step: "done", data }));
      } else {
        const err = (await res.json()) as { error?: string };
        setState({ step: "error", error: err.error ?? "Request failed" });
      }
    } catch (err) {
      setState({ step: "error", error: err instanceof Error ? err.message : "Network error" });
    }
  };

  const reset = () => setState({ step: "idle" });

  const isStep1Done =
    state.step === "step1_done" ||
    state.step === "step2_loading" ||
    state.step === "done";
  const isStep2Done = state.step === "done";

  return (
    <div>
      {/* Protocol info */}
      <div
        style={{
          background: "#f0f4ff",
          borderRadius: 8,
          padding: "12px 14px",
          marginBottom: 20,
          fontSize: 13,
          color: "#333",
        }}
      >
        <strong style={{ color: "#2244aa" }}>x402 HTTP Payment Protocol</strong>
        <span style={{ color: "#666", marginLeft: 6 }}>
          — EVM-native micropayments for AI agents
        </span>
        <div style={{ marginTop: 6, color: "#555", lineHeight: 1.5 }}>
          Agents make a standard HTTP request. The server returns{" "}
          <code
            style={{
              background: "#e8eeff",
              padding: "1px 5px",
              borderRadius: 3,
              fontFamily: "monospace",
              fontSize: 12,
            }}
          >
            402 Payment Required
          </code>{" "}
          with machine-readable payment specs. The agent pays on Base Sepolia
          (USDC, $0.001), then retries with proof. Zero middleware needed.
        </div>
      </div>

      {/* Step 1 */}
      <div
        style={{
          border: `1px solid ${isStep1Done ? "#4caf50" : "#dde4f0"}`,
          borderRadius: 8,
          marginBottom: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: isStep1Done ? "#f0fff4" : "#fafbff",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                fontWeight: 700,
                color: isStep1Done ? "#2d8653" : "#2244aa",
                fontSize: 13,
              }}
            >
              {isStep1Done ? "✓ " : ""}Step 1 — Request without payment
            </span>
            <span style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>
              GET /api/x402-data → HTTP 402
            </span>
          </div>
          <button
            onClick={runStep1}
            disabled={state.step === "step1_loading" || isStep1Done}
            style={{
              padding: "5px 14px",
              background: isStep1Done ? "#c8e6c9" : state.step === "step1_loading" ? "#e0e0e0" : "#2244aa",
              color: isStep1Done ? "#1b5e20" : state.step === "step1_loading" ? "#999" : "white",
              border: "none",
              borderRadius: 5,
              fontSize: 12,
              cursor: isStep1Done || state.step === "step1_loading" ? "default" : "pointer",
              fontWeight: 600,
              minWidth: 80,
            }}
          >
            {state.step === "step1_loading" ? "Sending..." : isStep1Done ? "Done" : "Run"}
          </button>
        </div>
        {isStep1Done && state.response402 && (
          <div
            style={{
              padding: "10px 14px",
              background: "#f9fffe",
              borderTop: "1px solid #e0ffe8",
            }}
          >
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>
              Server returned{" "}
              <strong style={{ color: "#c62828" }}>HTTP 402</strong> with payment
              requirements:
            </div>
            <pre
              style={{
                fontSize: 11,
                background: "#1e1e2e",
                color: "#cdd6f4",
                padding: "10px 12px",
                borderRadius: 6,
                overflow: "auto",
                margin: 0,
                maxHeight: 160,
              }}
            >
              {JSON.stringify(state.response402, null, 2)}
            </pre>
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "#666",
                lineHeight: 1.5,
              }}
            >
              The{" "}
              <code
                style={{
                  fontFamily: "monospace",
                  background: "#f3f4f8",
                  padding: "1px 4px",
                  borderRadius: 2,
                }}
              >
                accepts[0]
              </code>{" "}
              object tells the agent: pay{" "}
              <strong>$0.001 USDC on Base Sepolia</strong> to{" "}
              <code
                style={{
                  fontFamily: "monospace",
                  background: "#f3f4f8",
                  padding: "1px 4px",
                  borderRadius: 2,
                }}
              >
                {String((state.response402?.accepts as Array<{ payTo: string }>)?.[0]?.payTo ?? "").slice(0, 10)}…
              </code>
              .
            </div>
          </div>
        )}
      </div>

      {/* Step 2 */}
      <div
        style={{
          border: `1px solid ${isStep2Done ? "#4caf50" : "#dde4f0"}`,
          borderRadius: 8,
          marginBottom: 12,
          overflow: "hidden",
          opacity: isStep1Done ? 1 : 0.45,
          transition: "opacity 0.2s",
        }}
      >
        <div
          style={{
            background: isStep2Done ? "#f0fff4" : "#fafbff",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span
              style={{
                fontWeight: 700,
                color: isStep2Done ? "#2d8653" : "#2244aa",
                fontSize: 13,
              }}
            >
              {isStep2Done ? "✓ " : ""}Step 2 — Pay &amp; retry
            </span>
            <span style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>
              GET /api/x402-data + X-PAYMENT header
            </span>
          </div>
          <button
            onClick={runStep2}
            disabled={!isStep1Done || state.step === "step2_loading" || isStep2Done}
            style={{
              padding: "5px 14px",
              background: isStep2Done
                ? "#c8e6c9"
                : state.step === "step2_loading"
                ? "#e0e0e0"
                : isStep1Done
                ? "#1a7a3e"
                : "#ccc",
              color: isStep2Done
                ? "#1b5e20"
                : state.step === "step2_loading"
                ? "#999"
                : "white",
              border: "none",
              borderRadius: 5,
              fontSize: 12,
              cursor:
                !isStep1Done || isStep2Done || state.step === "step2_loading"
                  ? "default"
                  : "pointer",
              fontWeight: 600,
              minWidth: 80,
            }}
          >
            {state.step === "step2_loading"
              ? "Paying..."
              : isStep2Done
              ? "Done"
              : "Demo Pay"}
          </button>
        </div>
        {isStep2Done && state.data && (
          <div
            style={{
              padding: "10px 14px",
              background: "#f0fff4",
              borderTop: "1px solid #c8e6c9",
            }}
          >
            <div style={{ fontSize: 11, color: "#2d8653", marginBottom: 8, fontWeight: 600 }}>
              Payment verified — data delivered
            </div>
            <ServiceResultTable service={state.data} />
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: "#888",
                background: "#f3f4f8",
                padding: "6px 10px",
                borderRadius: 5,
                fontFamily: "monospace",
              }}
            >
              <span style={{ color: "#666" }}># Agent code (Python):</span>
              {"\n"}
              resp = httpx.get(&apos;/api/x402-data?service={selectedService}&apos;){"\n"}
              if resp.status_code == 402:{"\n"}
              {"    "}payment = resp.json()[&apos;accepts&apos;][0]{"\n"}
              {"    "}proof = wallet.pay(payment){" "}
              <span style={{ color: "#aaa" }}># EIP-3009 on Base Sepolia</span>
              {"\n"}
              {"    "}data = httpx.get(&apos;/api/x402-data&apos;, headers=&#123;&apos;X-PAYMENT&apos;: proof&#125;)
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {state.step === "error" && state.error && (
        <div
          style={{
            padding: "10px 14px",
            background: "#fff0f0",
            borderRadius: 8,
            color: "#c00",
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          <strong>Error:</strong> {state.error}
        </div>
      )}

      {/* Reset */}
      {(isStep1Done || state.step === "error") && (
        <button
          onClick={reset}
          style={{
            fontSize: 12,
            color: "#888",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px 0",
          }}
        >
          ↺ Reset demo
        </button>
      )}

      {/* Service note */}
      <p style={{ fontSize: 12, color: "#999", marginTop: 12, marginBottom: 0 }}>
        Demoing with: <strong>{selectedLabel}</strong> · Network: Base Sepolia (testnet) ·
        Price: $0.001 USDC
      </p>
    </div>
  );
}

/**
 * Builds the tour step sequence. When `liveData` is provided (pre-fetched from
 * /api/preview), the success step shows real data instead of hardcoded fallbacks.
 */
function buildTourSteps(serviceType: ServiceType, liveData?: ServiceResult): PaymentState[] {
  let mockService: ServiceResult;
  if (serviceType === "solana-stats") {
    const s = liveData?.solana_stats ?? MOCK_SOLANA_STATS;
    mockService = liveData ?? {
      service_type: "solana-stats",
      result: `TPS: ${s.tps.toLocaleString()} | Slot: ${s.slot.toLocaleString()} | Epoch: ${s.epoch} | Validators: ${s.validator_count.toLocaleString()}`,
      solana_stats: s,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "defi-yields") {
    mockService = liveData ?? {
      service_type: "defi-yields",
      result: "jito-liquid-staking JITOSOL 5.94% APY | marinade-liquid-staking MSOL 7.07% APY | drift-staked-sol DSOL 6.50% APY",
      defi_pools: MOCK_DEFI_POOLS,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "fear-greed") {
    const fg = liveData?.fear_greed ?? MOCK_FEAR_GREED;
    mockService = liveData ?? {
      service_type: "fear-greed",
      result: `Fear & Greed: ${fg.current_value}/100 (${fg.classification})`,
      fear_greed: fg,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "solana-ecosystem") {
    const eco = liveData?.solana_ecosystem ?? MOCK_SOLANA_ECOSYSTEM;
    mockService = liveData ?? {
      service_type: "solana-ecosystem",
      result: eco.tokens
        .slice(0, 4)
        .map((t) => `${t.symbol} $${t.price_usd < 1 ? t.price_usd.toFixed(4) : t.price_usd.toLocaleString()} (${t.change_24h_pct >= 0 ? "+" : ""}${t.change_24h_pct}%)`)
        .join(" | "),
      solana_ecosystem: eco,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "ai-models") {
    const ai = liveData?.ai_models ?? MOCK_AI_MODELS;
    mockService = liveData ?? {
      service_type: "ai-models",
      result: ai.models
        .slice(0, 3)
        .map((m) => {
          const name = m.displayName.split("/").pop() ?? m.displayName;
          return `${name} ★${m.likes.toLocaleString()}`;
        })
        .join(" | "),
      ai_models: ai,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "trending-coins") {
    const tr = liveData?.trending ?? MOCK_TRENDING;
    mockService = liveData ?? {
      service_type: "trending-coins",
      result: tr.coins
        .slice(0, 4)
        .map((c) => {
          const price = c.price_usd < 0.01 ? `$${c.price_usd.toFixed(6)}` : c.price_usd < 1 ? `$${c.price_usd.toFixed(4)}` : `$${c.price_usd.toLocaleString()}`;
          return `${c.symbol} ${price} (${c.change_24h_pct >= 0 ? "+" : ""}${c.change_24h_pct}%)`;
        })
        .join(" | "),
      trending: tr,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "top-gainers") {
    const tg = liveData?.top_gainers ?? MOCK_TOP_GAINERS;
    mockService = liveData ?? {
      service_type: "top-gainers",
      result: tg.gainers
        .slice(0, 4)
        .map((g) => `${g.symbol} +${g.change_24h_pct}%`)
        .join(" | "),
      top_gainers: tg,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "dex-volume") {
    const formatVol = (v: number) =>
      v >= 1_000_000_000
        ? `$${(v / 1_000_000_000).toFixed(1)}B`
        : v >= 1_000_000
        ? `$${(v / 1_000_000).toFixed(0)}M`
        : `$${(v / 1_000).toFixed(0)}K`;
    const dv = liveData?.dex_volume ?? MOCK_DEX_VOLUME;
    mockService = liveData ?? {
      service_type: "dex-volume",
      result: dv.dexes
        .slice(0, 3)
        .map((d) => `${d.name} ${formatVol(d.volume_24h)}`)
        .join(" | "),
      dex_volume: dv,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "pumpfun-tokens") {
    const formatVol = (v: number) =>
      v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;
    const pt = liveData?.pumpfun_tokens ?? MOCK_PUMPFUN_TOKENS;
    mockService = liveData ?? {
      service_type: "pumpfun-tokens",
      result: pt.tokens
        .slice(0, 3)
        .map((t) => `${t.symbol} ${formatVol(t.volume_24h)} vol`)
        .join(" | "),
      pumpfun_tokens: pt,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "pump-new") {
    const formatAge = (createdAt: number) => {
      const ageMs = Date.now() - createdAt;
      const hours = Math.floor(ageMs / 3_600_000);
      const minutes = Math.floor((ageMs % 3_600_000) / 60_000);
      if (hours >= 24) return `${Math.floor(hours / 24)}d ago`;
      if (hours > 0) return `${hours}h ago`;
      return `${minutes}m ago`;
    };
    const pn = liveData?.pump_new ?? MOCK_PUMP_NEW;
    mockService = liveData ?? {
      service_type: "pump-new",
      result: pn.tokens
        .slice(0, 3)
        .map((t) => `${t.symbol} (${formatAge(t.pair_created_at)})`)
        .join(" | "),
      pump_new: pn,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "funding-rates") {
    const formatRate = (r: number) => {
      const pct = (r * 100).toFixed(4);
      return r >= 0 ? `+${pct}%` : `${pct}%`;
    };
    const fr = liveData?.funding_rates ?? MOCK_FUNDING_RATES;
    mockService = liveData ?? {
      service_type: "funding-rates",
      result: fr.rates
        .slice(0, 4)
        .map((r) => `${r.symbol} ${formatRate(r.rate_8h)}/8h`)
        .join(" | "),
      funding_rates: fr,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "btc-mempool") {
    const bm = liveData?.btc_mempool ?? MOCK_BTC_MEMPOOL;
    mockService = liveData ?? {
      service_type: "btc-mempool",
      result: `${bm.count.toLocaleString()} pending txs | ${bm.vsize_mb} MB | Fast: ${bm.fee_fastest} sat/vB | 30min: ${bm.fee_30min} sat/vB | 1h: ${bm.fee_60min} sat/vB`,
      btc_mempool: bm,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "stablecoins") {
    const sc = liveData?.stablecoins ?? MOCK_STABLECOINS;
    const formatB = (v: number) =>
      v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`;
    mockService = liveData ?? {
      service_type: "stablecoins",
      result: sc.coins.slice(0, 4).map((c) => `${c.symbol} ${formatB(c.supply_usd)}`).join(" | "),
      stablecoins: sc,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "sol-protocol-tvl") {
    const st = liveData?.sol_tvl ?? MOCK_SOL_TVL;
    const formatTvl = (v: number) =>
      v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`;
    mockService = liveData ?? {
      service_type: "sol-protocol-tvl",
      result: st.protocols.slice(0, 4).map((p) => `${p.name} ${formatTvl(p.tvl_usd)}`).join(" | "),
      sol_tvl: st,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "ai-agent-tokens") {
    const at = liveData?.ai_agent_tokens ?? MOCK_AI_AGENT_TOKENS;
    const formatMcap = (v: number) =>
      v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(2)}B` : `$${(v / 1_000_000).toFixed(0)}M`;
    mockService = liveData ?? {
      service_type: "ai-agent-tokens",
      result: at.tokens.slice(0, 4).map((t) => `${t.symbol} ${formatMcap(t.market_cap_usd)} (${t.change_24h_pct >= 0 ? "+" : ""}${t.change_24h_pct}%)`).join(" | "),
      ai_agent_tokens: at,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "sol-revenue") {
    const sr = liveData?.sol_revenue ?? MOCK_SOL_REVENUE;
    const formatRev = (v: number) =>
      v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${(v / 1_000).toFixed(0)}K`;
    mockService = liveData ?? {
      service_type: "sol-revenue",
      result: sr.protocols.slice(0, 4).map((p) => `${p.name} ${formatRev(p.revenue_24h)}/24h`).join(" | "),
      sol_revenue: sr,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "eth-gas") {
    const eg = liveData?.eth_gas ?? MOCK_ETH_GAS;
    mockService = liveData ?? {
      service_type: "eth-gas",
      result: `Base: ${eg.base_fee_gwei} Gwei | ` +
        eg.levels.slice(1, 4).map((l) => `${l.label}: ${l.gwei} Gwei`).join(" | "),
      eth_gas: eg,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "global-market") {
    const gm = liveData?.global_market ?? MOCK_GLOBAL_MARKET;
    const fmtT = (n: number) => n >= 1e12 ? `$${(n / 1e12).toFixed(2)}T` : `$${(n / 1e9).toFixed(1)}B`;
    mockService = liveData ?? {
      service_type: "global-market",
      result: `Market: ${fmtT(gm.total_market_cap_usd)} (${gm.market_cap_change_24h_pct >= 0 ? "+" : ""}${gm.market_cap_change_24h_pct.toFixed(1)}%) | BTC ${gm.btc_dominance.toFixed(1)}% | ETH ${gm.eth_dominance.toFixed(1)}% | Vol: ${fmtT(gm.total_volume_24h_usd)}`,
      global_market: gm,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "l2-tvl") {
    const l2 = liveData?.l2_tvl ?? MOCK_L2_TVL;
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    mockService = liveData ?? {
      service_type: "l2-tvl",
      result: l2.chains.slice(0, 4).map((c) => `${c.name} ${fmtTvl(c.tvl_usd)}`).join(" | "),
      l2_tvl: l2,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "sol-lst") {
    const lst = liveData?.sol_lst ?? MOCK_SOL_LST;
    mockService = liveData ?? {
      service_type: "sol-lst",
      result: lst.tokens.slice(0, 4).map((t) => `${t.symbol} ${t.apy.toFixed(1)}% APY`).join(" | "),
      sol_lst: lst,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "polymarket") {
    const pm = liveData?.polymarket_data ?? MOCK_POLYMARKET;
    const fmtV = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;
    mockService = liveData ?? {
      service_type: "polymarket",
      result: pm.markets.slice(0, 3).map((m) => `${m.question.slice(0, 35)}… ${fmtV(m.volume_24h)}`).join(" | "),
      polymarket_data: pm,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "narratives") {
    const nd = liveData?.narratives ?? MOCK_NARRATIVES;
    mockService = liveData ?? {
      service_type: "narratives",
      result: nd.narratives.slice(0, 3).map((n) => `${n.name} ${n.change_24h_pct >= 0 ? "+" : ""}${n.change_24h_pct.toFixed(1)}%`).join(" | "),
      narratives: nd,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "defi-fees") {
    const ff = liveData?.defi_fees ?? MOCK_DEFI_FEES;
    const fmtFee = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;
    mockService = liveData ?? {
      service_type: "defi-fees",
      result: ff.entries.slice(0, 3).map((e) => `${e.name} ${fmtFee(e.total30d)} 30d`).join(" | "),
      defi_fees: ff,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "cex-volume") {
    const cv = liveData?.cex_volume ?? MOCK_CEX_VOLUME;
    const fmtVol = (v: number) => v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`;
    mockService = liveData ?? {
      service_type: "cex-volume",
      result: cv.exchanges.slice(0, 3).map((e) => `${e.name} ${fmtVol(e.volume_usd_24h)}`).join(" | "),
      cex_volume: cv,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "options-oi") {
    const oo = liveData?.options_oi ?? MOCK_OPTIONS_OI;
    const fmtOI = (v: number) => v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`;
    mockService = liveData ?? {
      service_type: "options-oi",
      result: oo.assets.map((a) => `${a.asset} OI ${fmtOI(a.total_oi_usd)} P/C ${a.put_call_ratio}`).join(" | "),
      options_oi: oo,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "options-max-pain") {
    const mp = liveData?.options_max_pain ?? MOCK_OPTIONS_MAX_PAIN;
    mockService = liveData ?? {
      service_type: "options-max-pain",
      result: mp.assets.map((a) => `${a.asset} max pain $${a.max_pain_strike.toLocaleString()} (${a.distance_pct > 0 ? "+" : ""}${a.distance_pct}% vs spot)`).join(" | "),
      options_max_pain: mp,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "btc-rainbow") {
    const rb = liveData?.btc_rainbow ?? MOCK_BTC_RAINBOW;
    mockService = liveData ?? {
      service_type: "btc-rainbow",
      result: `BTC $${rb.current_price_usd.toLocaleString()} · Model $${rb.model_price_usd.toLocaleString()} · ${rb.band.label} (${(rb.ratio * 100).toFixed(0)}% of model)`,
      btc_rainbow: rb,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "altcoin-season") {
    const as = liveData?.altcoin_season ?? MOCK_ALTCOIN_SEASON;
    mockService = liveData ?? {
      service_type: "altcoin-season",
      result: `${as.signal_label} · Score ${as.score}/100 · ${as.outperforming}/${as.total_coins} alts beat BTC (BTC 30d: ${as.btc_change_30d_pct >= 0 ? "+" : ""}${as.btc_change_30d_pct}%)`,
      altcoin_season: as,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "btc-mining") {
    const bm = liveData?.btc_mining ?? MOCK_BTC_MINING;
    mockService = liveData ?? {
      service_type: "btc-mining",
      result: `${bm.hashrate_eh} EH/s · Next adjustment ${bm.difficulty_change_pct >= 0 ? "+" : ""}${bm.difficulty_change_pct}% in ${bm.remaining_blocks} blocks (${bm.days_until_retarget}d) · Avg block ${bm.avg_block_time_sec}s`,
      btc_mining: bm,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "bridge-volume") {
    const bv = liveData?.bridge_volume ?? MOCK_BRIDGE_VOLUME;
    mockService = liveData ?? {
      service_type: "bridge-volume",
      result: `Top bridge: ${bv.bridges[0]?.name} $${(bv.bridges[0]?.volume_24h_usd / 1e6).toFixed(0)}M · Total 24h $${(bv.total_24h_usd / 1e9).toFixed(2)}B across ${bv.bridges.length} bridges`,
      bridge_volume: bv,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "tvl-movers") {
    const tm = liveData?.tvl_movers ?? MOCK_TVL_MOVERS;
    mockService = liveData ?? {
      service_type: "tvl-movers",
      result: `Top gainer: ${tm.gainers[0]?.name} +${tm.gainers[0]?.change_7d_pct.toFixed(1)}% 7d · Biggest drop: ${tm.losers[0]?.name} ${tm.losers[0]?.change_7d_pct.toFixed(1)}% 7d · Total DeFi TVL $${(tm.total_defi_tvl / 1e9).toFixed(1)}B`,
      tvl_movers: tm,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "lightning-network") {
    const ln = liveData?.lightning_network ?? MOCK_LIGHTNING_NETWORK;
    mockService = liveData ?? {
      service_type: "lightning-network",
      result: `${ln.channel_count.toLocaleString()} channels · ${ln.node_count.toLocaleString()} nodes · ${ln.total_capacity_btc.toFixed(0)} BTC locked · ${ln.channel_count_change >= 0 ? "+" : ""}${ln.channel_count_change} channels WoW`,
      lightning_network: ln,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "eth-lst") {
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const lst = liveData?.eth_lst ?? MOCK_ETH_LST;
    mockService = liveData ?? {
      service_type: "eth-lst",
      result: lst.tokens.slice(0, 4).map((t) => `${t.symbol} ${t.apy.toFixed(1)}% APY (${fmtTvl(t.tvl_usd)})`).join(" | "),
      eth_lst: lst,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "realized-vol") {
    const rv = liveData?.realized_vol ?? MOCK_REALIZED_VOL;
    mockService = liveData ?? {
      service_type: "realized-vol",
      result: `Regime: ${rv.market_regime} · ` + rv.assets.map((a) => `${a.symbol} 30d=${a.vol_30d_pct}% 7d=${a.vol_7d_pct}%`).join(" · "),
      realized_vol: rv,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "lending-rates") {
    const lr = liveData?.lending_rates ?? MOCK_LENDING_RATES;
    mockService = liveData ?? {
      service_type: "lending-rates",
      result: `Best stable: ${lr.best_stable_protocol} ${lr.best_stable_apy.toFixed(2)}% · Best ETH: ${lr.best_eth_protocol} ${lr.best_eth_apy.toFixed(2)}% · ` +
        lr.pools.slice(0, 3).map((p) => `${p.symbol} ${p.supply_apy.toFixed(2)}%`).join(" · "),
      lending_rates: lr,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "protocol-revenue") {
    const pr = liveData?.protocol_revenue ?? MOCK_PROTOCOL_REVENUE;
    const fmtRev = (v: number) => v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(2)}B` : v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;
    mockService = liveData ?? {
      service_type: "protocol-revenue",
      result: pr.entries.slice(0, 3).map((e) => `${e.name} ${fmtRev(e.revenue_30d)} 30d`).join(" | "),
      protocol_revenue: pr,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "btc-onchain") {
    const bo = liveData?.btc_onchain ?? MOCK_BTC_ONCHAIN;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    mockService = liveData ?? {
      service_type: "btc-onchain",
      result: `${bo.tx_count_24h.toLocaleString()} txs · ${fmtUsd(bo.tx_volume_usd)} transferred · ${bo.blocks_mined_24h} blocks · subsidy ${fmtUsd(bo.subsidy_revenue_usd)}`,
      btc_onchain: bo,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "nft-market") {
    const nm = liveData?.nft_market ?? MOCK_NFT_MARKET;
    const fmtUsd = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(1)}K` : `$${v.toLocaleString()}`;
    mockService = liveData ?? {
      service_type: "nft-market",
      result: nm.collections.slice(0, 3).map((c) => `${c.symbol} floor ${fmtUsd(c.floor_price_usd)} (${c.change_24h_pct >= 0 ? "+" : ""}${c.change_24h_pct.toFixed(1)}%)`).join(" · "),
      nft_market: nm,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "market-breadth") {
    const mb = liveData?.market_breadth ?? MOCK_MARKET_BREADTH;
    mockService = liveData ?? {
      service_type: "market-breadth",
      result: `${mb.advancing}/${mb.total} advancing (${mb.breadth_score}% breadth) · top: ${mb.top_gainers[0]?.symbol} +${mb.top_gainers[0]?.change_24h_pct.toFixed(1)}% · worst: ${mb.top_losers[0]?.symbol} ${mb.top_losers[0]?.change_24h_pct.toFixed(1)}%`,
      market_breadth: mb,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "perp-oi") {
    const po = liveData?.perp_oi ?? MOCK_PERP_OI;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    mockService = liveData ?? {
      service_type: "perp-oi",
      result: `${po.exchanges[0].name} ${fmtUsd(po.exchanges[0].oi_usd)} OI · ${po.exchanges[1]?.name ?? ""} ${fmtUsd(po.exchanges[1]?.oi_usd ?? 0)} · top-10 total ${fmtUsd(po.total_oi_usd)}`,
      perp_oi: po,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "stablecoin-chains") {
    const sc = liveData?.stablecoin_chains ?? MOCK_STABLECOIN_CHAINS;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    mockService = liveData ?? {
      service_type: "stablecoin-chains",
      result: `${sc.top_chain} ${fmtUsd(sc.chains[0].tvl_usd)} (${sc.top_chain_pct}%) · top-12 total ${fmtUsd(sc.total_usd)}`,
      stablecoin_chains: sc,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else {
    const md = liveData?.market_data ?? MOCK_MARKET_DATA;
    mockService = liveData ?? {
      service_type: "crypto-prices",
      result: md
        .map((m) => `${m.symbol} $${m.price_usd.toLocaleString()} (${m.change_24h_pct >= 0 ? "+" : ""}${m.change_24h_pct}% 24h)`)
        .join(" | "),
      market_data: md,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  }

  return [
    { status: "building" },
    { status: "signing" },
    { status: "confirming" },
    { status: "verifying" },
    { status: "success", service: mockService, signature: MOCK_SIGNATURE },
  ];
}

/**
 * Signs a base64-encoded unsigned transaction and submits it.
 * Returns the signature without waiting for on-chain confirmation.
 */
async function signAndSubmitTransaction(
  txBase64: string,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  connection: import("@solana/web3.js").Connection
): Promise<string> {
  const tx = Transaction.from(Buffer.from(txBase64, "base64"));
  const signedTx = await signTransaction(tx);

  return connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });
}

/** Waits for a submitted transaction to reach confirmed commitment. */
async function awaitConfirmation(
  signature: string,
  connection: import("@solana/web3.js").Connection
): Promise<void> {
  const latestBlockhash = await connection.getLatestBlockhash("confirmed");
  await connection.confirmTransaction(
    { signature, ...latestBlockhash },
    "confirmed"
  );
}

function ServiceResultTable({ service }: { service: ServiceResult }) {
  if (service.service_type === "crypto-prices" && service.market_data && service.market_data.length > 0) {
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Asset</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Price (USD)</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h</th>
          </tr>
        </thead>
        <tbody>
          {service.market_data.map((m) => (
            <tr key={m.symbol} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "8px 8px", fontWeight: 700 }}>{m.symbol}</td>
              <td style={{ padding: "8px 8px", textAlign: "right" }}>${m.price_usd.toLocaleString()}</td>
              <td style={{
                padding: "8px 8px",
                textAlign: "right",
                color: m.change_24h_pct >= 0 ? "#1a7a3e" : "#c00",
                fontWeight: 600,
              }}>
                {m.change_24h_pct >= 0 ? "+" : ""}{m.change_24h_pct}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (service.service_type === "solana-stats" && service.solana_stats) {
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
        <tbody>
          {[
            { label: "Transactions / sec (TPS)", value: service.solana_stats.tps.toLocaleString() },
            { label: "Current Slot", value: service.solana_stats.slot.toLocaleString() },
            { label: "Current Epoch", value: service.solana_stats.epoch.toLocaleString() },
            { label: "Active Validators", value: service.solana_stats.validator_count.toLocaleString() },
          ].map(({ label, value }) => (
            <tr key={label} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "8px 8px", color: "#666", fontSize: 13 }}>{label}</td>
              <td style={{ padding: "8px 8px", textAlign: "right", fontWeight: 700 }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (service.service_type === "defi-yields" && service.defi_pools && service.defi_pools.length > 0) {
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Protocol</th>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Token</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>APY</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>TVL</th>
          </tr>
        </thead>
        <tbody>
          {service.defi_pools.map((p) => (
            <tr key={`${p.protocol}-${p.symbol}`} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "7px 8px", fontSize: 12, color: "#444" }}>{p.protocol}</td>
              <td style={{ padding: "7px 8px", fontWeight: 700, fontSize: 13 }}>{p.symbol}</td>
              <td style={{
                padding: "7px 8px",
                textAlign: "right",
                color: p.apy > 0 ? "#1a7a3e" : "#999",
                fontWeight: 600,
              }}>
                {p.apy > 0 ? `${p.apy.toFixed(2)}%` : "—"}
              </td>
              <td style={{ padding: "7px 8px", textAlign: "right", color: "#555", fontSize: 12 }}>
                ${(p.tvl_usd / 1_000_000).toFixed(0)}M
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (service.service_type === "fear-greed" && service.fear_greed) {
    const fg = service.fear_greed;
    const score = fg.current_value;
    // Color thresholds: 0-24 Extreme Fear, 25-44 Fear, 45-55 Neutral, 56-74 Greed, 75-100 Extreme Greed
    const scoreColor =
      score <= 24 ? "#c0392b" :
      score <= 44 ? "#e67e22" :
      score <= 55 ? "#f1c40f" :
      score <= 74 ? "#27ae60" :
                    "#1a8a4a";
    const bgColor =
      score <= 24 ? "#fdf0ee" :
      score <= 44 ? "#fef6ed" :
      score <= 55 ? "#fefde7" :
      score <= 74 ? "#edfaf1" :
                    "#e8f8ef";

    return (
      <div>
        {/* Big score display */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "12px 14px",
          background: bgColor,
          borderRadius: 8,
          marginBottom: 12,
        }}>
          <div style={{
            fontSize: 48,
            fontWeight: 800,
            color: scoreColor,
            lineHeight: 1,
            minWidth: 64,
            textAlign: "center",
          }}>
            {score}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: scoreColor }}>{fg.classification}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>out of 100</div>
          </div>
        </div>
        {/* 7-day history table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 11 }}>Date</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 11 }}>Score</th>
              <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 11 }}>Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {fg.history.map((entry, i) => {
              const entryColor =
                entry.value <= 24 ? "#c0392b" :
                entry.value <= 44 ? "#e67e22" :
                entry.value <= 55 ? "#b8960c" :
                entry.value <= 74 ? "#27ae60" :
                                    "#1a8a4a";
              return (
                <tr key={entry.date} style={{ borderBottom: "1px solid #f0f0f0", background: i === 0 ? "#fafafa" : "transparent" }}>
                  <td style={{ padding: "6px 8px", color: i === 0 ? "#222" : "#666", fontWeight: i === 0 ? 600 : 400 }}>
                    {i === 0 ? "Today" : entry.date}
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: entryColor }}>{entry.value}</td>
                  <td style={{ padding: "6px 8px", color: entryColor, fontSize: 12 }}>{entry.classification}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (service.service_type === "solana-ecosystem" && service.solana_ecosystem && service.solana_ecosystem.tokens.length > 0) {
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Token</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Price (USD)</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Mkt Cap</th>
          </tr>
        </thead>
        <tbody>
          {service.solana_ecosystem.tokens.map((t) => (
            <tr key={t.symbol} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <td style={{ padding: "7px 8px" }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{t.symbol}</span>
                <span style={{ color: "#888", fontSize: 11, marginLeft: 6 }}>{t.name}</span>
              </td>
              <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600 }}>
                ${t.price_usd < 0.01
                  ? t.price_usd.toFixed(6)
                  : t.price_usd < 1
                  ? t.price_usd.toFixed(4)
                  : t.price_usd.toLocaleString()}
              </td>
              <td style={{
                padding: "7px 8px",
                textAlign: "right",
                color: t.change_24h_pct >= 0 ? "#1a7a3e" : "#c00",
                fontWeight: 600,
              }}>
                {t.change_24h_pct >= 0 ? "+" : ""}{t.change_24h_pct}%
              </td>
              <td style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontSize: 12 }}>
                ${(t.market_cap_usd / 1_000_000).toFixed(0)}M
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (service.service_type === "ai-models" && service.ai_models && service.ai_models.models.length > 0) {
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Model</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>★ Likes</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Downloads</th>
          </tr>
        </thead>
        <tbody>
          {service.ai_models.models.map((m) => {
            const parts = m.displayName.split("/");
            const org = parts.length > 1 ? parts[0] : null;
            const name = parts.length > 1 ? parts[1] : parts[0];
            return (
              <tr key={m.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{name}</span>
                  {org && <span style={{ color: "#888", fontSize: 11, marginLeft: 5 }}>{org}</span>}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, color: "#2244aa" }}>
                  {m.likes.toLocaleString()}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontSize: 12 }}>
                  {m.downloads > 1_000_000
                    ? `${(m.downloads / 1_000_000).toFixed(1)}M`
                    : m.downloads > 1_000
                    ? `${(m.downloads / 1_000).toFixed(0)}K`
                    : m.downloads.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (service.service_type === "trending-coins" && service.trending && service.trending.coins.length > 0) {
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>#</th>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Coin</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Price</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Mkt Cap</th>
          </tr>
        </thead>
        <tbody>
          {service.trending.coins.map((c, i) => {
            const price =
              c.price_usd < 0.0001
                ? `$${c.price_usd.toFixed(8)}`
                : c.price_usd < 0.01
                ? `$${c.price_usd.toFixed(6)}`
                : c.price_usd < 1
                ? `$${c.price_usd.toFixed(4)}`
                : `$${c.price_usd.toLocaleString()}`;
            const changeColor = c.change_24h_pct >= 0 ? "#1a7a3e" : "#c0392b";
            return (
              <tr key={c.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                <td style={{ padding: "7px 8px" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{c.symbol}</span>
                  <span style={{ color: "#888", fontSize: 11, marginLeft: 5 }}>{c.name}</span>
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600 }}>{price}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, color: changeColor }}>
                  {c.change_24h_pct >= 0 ? "+" : ""}{c.change_24h_pct}%
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontSize: 12 }}>
                  {c.market_cap ?? (c.market_cap_rank ? `#${c.market_cap_rank}` : "—")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (service.service_type === "top-gainers" && service.top_gainers && service.top_gainers.gainers.length > 0) {
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>#</th>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Coin</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Price</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Volume</th>
          </tr>
        </thead>
        <tbody>
          {service.top_gainers.gainers.map((g, i) => {
            const price =
              g.price_usd < 0.0001
                ? `$${g.price_usd.toFixed(8)}`
                : g.price_usd < 0.01
                ? `$${g.price_usd.toFixed(6)}`
                : g.price_usd < 1
                ? `$${g.price_usd.toFixed(4)}`
                : `$${g.price_usd.toLocaleString()}`;
            const vol =
              g.volume_24h >= 1_000_000_000
                ? `$${(g.volume_24h / 1_000_000_000).toFixed(1)}B`
                : `$${(g.volume_24h / 1_000_000).toFixed(0)}M`;
            return (
              <tr key={g.symbol + i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                <td style={{ padding: "7px 8px" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{g.symbol}</span>
                  <span style={{ color: "#888", fontSize: 11, marginLeft: 5 }}>{g.name}</span>
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600 }}>{price}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, color: "#1a7a3e" }}>
                  +{g.change_24h_pct}%
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontSize: 12 }}>{vol}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (service.service_type === "dex-volume" && service.dex_volume && service.dex_volume.dexes.length > 0) {
    const formatVol = (v: number) =>
      v >= 1_000_000_000
        ? `$${(v / 1_000_000_000).toFixed(1)}B`
        : v >= 1_000_000
        ? `$${(v / 1_000_000).toFixed(0)}M`
        : `$${(v / 1_000).toFixed(0)}K`;
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>#</th>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>DEX</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h Volume</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>7d Volume</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h Change</th>
          </tr>
        </thead>
        <tbody>
          {service.dex_volume.dexes.map((d, i) => {
            const changeColor = d.change_1d >= 0 ? "#1a7a3e" : "#c0392b";
            return (
              <tr key={d.name + i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                <td style={{ padding: "7px 8px", fontWeight: 700, fontSize: 13 }}>{d.name}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600 }}>{formatVol(d.volume_24h)}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontSize: 12 }}>{formatVol(d.volume_7d)}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, color: changeColor }}>
                  {d.change_1d >= 0 ? "+" : ""}{d.change_1d}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (service.service_type === "pumpfun-tokens" && service.pumpfun_tokens && service.pumpfun_tokens.tokens.length > 0) {
    const formatVol = (v: number) =>
      v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;
    const formatMcap = (v: number) =>
      v >= 1_000_000_000
        ? `$${(v / 1_000_000_000).toFixed(1)}B`
        : v >= 1_000_000
        ? `$${(v / 1_000_000).toFixed(1)}M`
        : v > 0
        ? `$${(v / 1_000).toFixed(0)}K`
        : "—";
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>#</th>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Token</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Price</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Vol 24h</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Mkt Cap</th>
          </tr>
        </thead>
        <tbody>
          {service.pumpfun_tokens.tokens.map((t, i) => {
            const price =
              t.price_usd < 0.000001
                ? `$${t.price_usd.toFixed(10)}`
                : t.price_usd < 0.0001
                ? `$${t.price_usd.toFixed(8)}`
                : t.price_usd < 0.01
                ? `$${t.price_usd.toFixed(6)}`
                : t.price_usd < 1
                ? `$${t.price_usd.toFixed(4)}`
                : `$${t.price_usd.toLocaleString()}`;
            const changeColor = t.change_24h_pct >= 0 ? "#1a7a3e" : "#c0392b";
            return (
              <tr key={t.address} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                <td style={{ padding: "7px 8px" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{t.symbol}</span>
                  {t.name !== t.symbol && <span style={{ color: "#888", fontSize: 11, marginLeft: 5 }}>{t.name}</span>}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600 }}>{price}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, color: changeColor }}>
                  {t.change_24h_pct >= 0 ? "+" : ""}{t.change_24h_pct}%
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontSize: 12 }}>{formatVol(t.volume_24h)}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontSize: 12 }}>{formatMcap(t.market_cap)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (service.service_type === "pump-new" && service.pump_new && service.pump_new.tokens.length > 0) {
    const formatAge = (createdAt: number) => {
      const ageMs = Date.now() - createdAt;
      const hours = Math.floor(ageMs / 3_600_000);
      const minutes = Math.floor((ageMs % 3_600_000) / 60_000);
      if (hours >= 24) return `${Math.floor(hours / 24)}d ago`;
      if (hours > 0) return `${hours}h ago`;
      return `${minutes}m ago`;
    };
    const formatVol = (v: number) =>
      v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;
    const formatMcap = (v: number) =>
      v >= 1_000_000
        ? `$${(v / 1_000_000).toFixed(1)}M`
        : v > 0
        ? `$${(v / 1_000).toFixed(0)}K`
        : "—";
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>#</th>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Token</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Age</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Vol 24h</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Mkt Cap</th>
          </tr>
        </thead>
        <tbody>
          {service.pump_new.tokens.map((t, i) => {
            const changeColor = t.change_24h_pct >= 0 ? "#1a7a3e" : "#c0392b";
            return (
              <tr key={t.address} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                <td style={{ padding: "7px 8px" }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{t.symbol}</span>
                  {t.name !== t.symbol && <span style={{ color: "#888", fontSize: 11, marginLeft: 5 }}>{t.name}</span>}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#7a44cc", fontWeight: 600, fontSize: 12 }}>
                  {formatAge(t.pair_created_at)}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, color: changeColor }}>
                  {t.change_24h_pct >= 0 ? "+" : ""}{t.change_24h_pct}%
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontSize: 12 }}>{formatVol(t.volume_24h)}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontSize: 12 }}>{formatMcap(t.market_cap)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (service.service_type === "funding-rates" && service.funding_rates && service.funding_rates.rates.length > 0) {
    const formatRate = (r: number) => {
      const pct = (r * 100).toFixed(4);
      return r >= 0 ? `+${pct}%` : `${pct}%`;
    };
    const formatOI = (v: number) =>
      v >= 1_000_000_000
        ? `$${(v / 1_000_000_000).toFixed(1)}B`
        : v >= 1_000_000
        ? `$${(v / 1_000_000).toFixed(0)}M`
        : `$${(v / 1_000).toFixed(0)}K`;
    const formatPrice = (p: number) =>
      p >= 1_000 ? `$${p.toLocaleString(undefined, { maximumFractionDigits: 0 })}` :
      p >= 1 ? `$${p.toFixed(2)}` :
      p >= 0.01 ? `$${p.toFixed(4)}` :
      `$${p.toFixed(6)}`;
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #eee" }}>
            <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Perp</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Rate / 8h</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Signal</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Mark</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>OI</th>
          </tr>
        </thead>
        <tbody>
          {service.funding_rates.rates.map((r) => {
            const rateColor = r.rate_8h > 0.0002 ? "#c0392b" : r.rate_8h < -0.0001 ? "#1a7a3e" : "#555";
            const signal = r.rate_8h > 0.0001 ? "longs pay" : r.rate_8h < -0.0001 ? "shorts pay" : "neutral";
            const signalColor = r.rate_8h > 0.0001 ? "#c0392b" : r.rate_8h < -0.0001 ? "#1a7a3e" : "#888";
            return (
              <tr key={r.symbol} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", fontWeight: 700, fontSize: 13 }}>{r.symbol}-PERP</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700, color: rateColor }}>
                  {formatRate(r.rate_8h)}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontSize: 11, color: signalColor, fontWeight: 600 }}>
                  {signal}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontSize: 12 }}>
                  {formatPrice(r.mark_price)}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontSize: 12 }}>
                  {formatOI(r.open_interest)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  if (service.service_type === "btc-mempool" && service.btc_mempool) {
    const bm = service.btc_mempool;
    const congestion = bm.fee_fastest > 50 ? "High" : bm.fee_fastest > 20 ? "Moderate" : "Low";
    const congestionColor = bm.fee_fastest > 50 ? "#c00" : bm.fee_fastest > 20 ? "#d97706" : "#1a7a3e";
    const rows: { label: string; value: string; note?: string }[] = [
      { label: "Pending Txs", value: bm.count.toLocaleString(), note: "unconfirmed transactions" },
      { label: "Mempool Size", value: `${bm.vsize_mb} MB`, note: "virtual bytes queued" },
      { label: "Next Block", value: `${bm.fee_fastest} sat/vB`, note: "fastest confirmation" },
      { label: "~30 min", value: `${bm.fee_30min} sat/vB`, note: "half-hour estimate" },
      { label: "~1 hour", value: `${bm.fee_60min} sat/vB`, note: "economy rate" },
    ];
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "#777" }}>Network congestion:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: congestionColor }}>{congestion}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Metric</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Value</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", fontWeight: 600 }}>{r.label}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700 }}>{r.value}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#999", fontSize: 11 }}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (service.service_type === "stablecoins" && service.stablecoins) {
    const sc = service.stablecoins;
    const formatSupply = (v: number) =>
      v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(2)}B` : `$${(v / 1_000_000).toFixed(0)}M`;
    const totalFormatted = formatSupply(sc.total_supply_usd);
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "#777" }}>Total shown supply:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#2244aa" }}>{totalFormatted}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Stablecoin</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Supply</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h Δ</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Mechanism</th>
            </tr>
          </thead>
          <tbody>
            {sc.coins.map((c) => {
              const changeColor = c.change_24h_pct > 0 ? "#1a7a3e" : c.change_24h_pct < 0 ? "#c00" : "#999";
              return (
                <tr key={c.symbol} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "7px 8px", fontWeight: 600 }}>
                    {c.symbol}
                    <span style={{ color: "#999", fontWeight: 400, fontSize: 11, marginLeft: 4 }}>{c.name}</span>
                  </td>
                  <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700 }}>{formatSupply(c.supply_usd)}</td>
                  <td style={{ padding: "7px 8px", textAlign: "right", color: changeColor, fontWeight: 600, fontSize: 13 }}>
                    {c.change_24h_pct >= 0 ? "+" : ""}{c.change_24h_pct.toFixed(3)}%
                  </td>
                  <td style={{ padding: "7px 8px", textAlign: "right", color: "#999", fontSize: 11 }}>{c.peg_mechanism}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (service.service_type === "sol-protocol-tvl" && service.sol_tvl) {
    const st = service.sol_tvl;
    const formatTvl = (v: number) =>
      v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(2)}B` : `$${(v / 1_000_000).toFixed(0)}M`;
    const totalFormatted = formatTvl(st.total_tvl_usd);
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "#777" }}>Total TVL shown:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#2244aa" }}>{totalFormatted}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Protocol</th>
              <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Category</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>TVL</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h Δ</th>
            </tr>
          </thead>
          <tbody>
            {st.protocols.map((p) => {
              const changeColor = p.change_1d_pct > 0 ? "#1a7a3e" : p.change_1d_pct < 0 ? "#c00" : "#999";
              return (
                <tr key={p.name} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "7px 8px", fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: "7px 8px", color: "#666", fontSize: 12 }}>{p.category}</td>
                  <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700 }}>{formatTvl(p.tvl_usd)}</td>
                  <td style={{ padding: "7px 8px", textAlign: "right", color: changeColor, fontWeight: 600, fontSize: 13 }}>
                    {p.change_1d_pct >= 0 ? "+" : ""}{p.change_1d_pct.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (service.service_type === "ai-agent-tokens" && service.ai_agent_tokens) {
    const at = service.ai_agent_tokens;
    const formatMcap = (v: number) =>
      v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(2)}B` : `$${(v / 1_000_000).toFixed(0)}M`;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "#777" }}>Top AI Agent tokens by market cap — CoinGecko</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Token</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Price</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Mkt Cap</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h Δ</th>
            </tr>
          </thead>
          <tbody>
            {at.tokens.map((t) => {
              const changeColor = t.change_24h_pct > 0 ? "#1a7a3e" : t.change_24h_pct < 0 ? "#c00" : "#999";
              const priceStr = t.price_usd >= 1 ? `$${t.price_usd.toFixed(3)}` : `$${t.price_usd.toPrecision(4)}`;
              return (
                <tr key={t.symbol} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "7px 8px", fontWeight: 600 }}>
                    {t.symbol}
                    <span style={{ color: "#999", fontWeight: 400, fontSize: 11, marginLeft: 4 }}>{t.name}</span>
                  </td>
                  <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700 }}>{priceStr}</td>
                  <td style={{ padding: "7px 8px", textAlign: "right", color: "#444" }}>{formatMcap(t.market_cap_usd)}</td>
                  <td style={{ padding: "7px 8px", textAlign: "right", color: changeColor, fontWeight: 600, fontSize: 13 }}>
                    {t.change_24h_pct >= 0 ? "+" : ""}{t.change_24h_pct.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (service.service_type === "sol-revenue" && service.sol_revenue) {
    const sr = service.sol_revenue;
    const formatRev = (v: number) =>
      v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}M` : `$${(v / 1_000).toFixed(0)}K`;
    const totalFormatted = formatRev(sr.total_revenue_24h);
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "#777" }}>Total 24h revenue shown:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#2244aa" }}>{totalFormatted}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Protocol</th>
              <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Category</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h Revenue</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>7d Revenue</th>
            </tr>
          </thead>
          <tbody>
            {sr.protocols.map((p) => (
              <tr key={p.name} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: "7px 8px", color: "#666", fontSize: 12 }}>{p.category}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700 }}>{formatRev(p.revenue_24h)}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#444" }}>{formatRev(p.revenue_7d)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (service.service_type === "eth-gas" && service.eth_gas) {
    const eg = service.eth_gas;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "#777" }}>Base fee:</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#2244aa" }}>{eg.base_fee_gwei} Gwei</span>
          <span style={{ fontSize: 12, color: "#777" }}>ETH price:</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>${eg.eth_price_usd.toLocaleString()}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left",  padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Speed</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Max Fee (Gwei)</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Est. Wait</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Transfer Cost</th>
            </tr>
          </thead>
          <tbody>
            {eg.levels.map((l) => (
              <tr key={l.label} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", fontWeight: 600 }}>{l.label}</td>
                <td style={{ padding: "7px 8px", textAlign: "right" }}>{l.gwei}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#666", fontSize: 12 }}>{l.wait}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600 }}>
                  ${l.cost_usd < 0.001 ? l.cost_usd.toFixed(5) : l.cost_usd.toFixed(4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (service.service_type === "global-market" && service.global_market) {
    const gm = service.global_market;
    const fmtT = (n: number) => n >= 1e12 ? `$${(n / 1e12).toFixed(2)}T` : n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : `$${(n / 1e6).toFixed(0)}M`;
    const changeColor = gm.market_cap_change_24h_pct >= 0 ? "#1a7a3a" : "#c0392b";
    const rows: Array<{ label: string; value: string; sub?: string }> = [
      {
        label: "Total Market Cap",
        value: fmtT(gm.total_market_cap_usd),
        sub: `${gm.market_cap_change_24h_pct >= 0 ? "+" : ""}${gm.market_cap_change_24h_pct.toFixed(2)}% 24h`,
      },
      { label: "24h Trading Volume", value: fmtT(gm.total_volume_24h_usd) },
      { label: "BTC Dominance", value: `${gm.btc_dominance.toFixed(1)}%` },
      { label: "ETH Dominance", value: `${gm.eth_dominance.toFixed(1)}%` },
      { label: "Active Cryptocurrencies", value: gm.active_cryptos.toLocaleString() },
      ...(gm.defi_market_cap_usd > 0 ? [{ label: "DeFi Market Cap", value: fmtT(gm.defi_market_cap_usd) }] : []),
      ...(gm.stablecoin_volume_24h_usd > 0 ? [{ label: "Stablecoin 24h Volume", value: fmtT(gm.stablecoin_volume_24h_usd) }] : []),
    ];
    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", color: "#555", fontSize: 13 }}>{row.label}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700 }}>{row.value}</td>
                {row.sub !== undefined && (
                  <td style={{ padding: "7px 8px", textAlign: "right", color: changeColor, fontSize: 12, fontWeight: 600 }}>{row.sub}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (service.service_type === "l2-tvl" && service.l2_tvl) {
    const l2 = service.l2_tvl;
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>Chain</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>TVL</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>24h</th>
            </tr>
          </thead>
          <tbody>
            {l2.chains.map((c) => (
              <tr key={c.name} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", fontWeight: 600 }}>{c.name}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700 }}>{fmtTvl(c.tvl_usd)}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: c.change_1d_pct >= 0 ? "#1a7a3a" : "#c0392b", fontWeight: 600, fontSize: 13 }}>
                  {c.change_1d_pct >= 0 ? "+" : ""}{c.change_1d_pct.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Showing top {l2.chains.length} L2s · Total: {fmtTvl(l2.total_tvl_usd)} · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "sol-lst" && service.sol_lst) {
    const lst = service.sol_lst;
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>Token</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>APY</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>TVL</th>
            </tr>
          </thead>
          <tbody>
            {lst.tokens.map((t) => (
              <tr key={t.symbol} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px" }}>
                  <span style={{ fontWeight: 700 }}>{t.symbol}</span>
                  <span style={{ fontSize: 12, color: "#888", marginLeft: 6 }}>{t.project}</span>
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700, color: "#1a7a3a" }}>{t.apy.toFixed(2)}%</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600 }}>{fmtTvl(t.tvl_usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          {lst.tokens.length} LSTs · Avg APY: {lst.avg_apy.toFixed(2)}% · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "polymarket" && service.polymarket_data) {
    const pm = service.polymarket_data;
    const fmtVol = (v: number) => v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;
    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>Market</th>
              <th style={{ padding: "6px 8px", textAlign: "center", fontSize: 12, color: "#888", fontWeight: 600 }}>Yes</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>24h Vol</th>
            </tr>
          </thead>
          <tbody>
            {pm.markets.map((m, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", maxWidth: 280 }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{m.question}</span>
                </td>
                <td style={{ padding: "7px 8px", textAlign: "center" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    background: m.prices[0] >= 0.5 ? "#e6f7ee" : "#fff0f0",
                    color: m.prices[0] >= 0.5 ? "#1a7a3a" : "#c0392b",
                  }}>
                    {(m.prices[0] * 100).toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, fontSize: 13 }}>{fmtVol(m.volume_24h)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          {pm.markets.length} markets · Total 24h vol: {fmtVol(pm.total_volume_24h)} · via Polymarket
        </p>
      </div>
    );
  }

  if (service.service_type === "narratives" && service.narratives) {
    const nd = service.narratives;
    const fmtMcap = (v: number) =>
      v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`;
    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>Narrative</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>24h</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>Mkt Cap</th>
            </tr>
          </thead>
          <tbody>
            {nd.narratives.map((n, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px" }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{n.name}</span>
                  {n.top_coins.length > 0 && (
                    <span style={{ display: "block", fontSize: 11, color: "#aaa", marginTop: 1 }}>
                      {n.top_coins.join(" · ")}
                    </span>
                  )}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 7px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    background: n.change_24h_pct >= 0 ? "#e6f7ee" : "#fff0f0",
                    color: n.change_24h_pct >= 0 ? "#1a7a3a" : "#c0392b",
                  }}>
                    {n.change_24h_pct >= 0 ? "+" : ""}{n.change_24h_pct.toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, fontSize: 13, color: "#444" }}>
                  {fmtMcap(n.market_cap)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          {nd.narratives.length} narratives · sorted by 24h market cap change · via CoinGecko
        </p>
      </div>
    );
  }

  if (service.service_type === "defi-fees" && service.defi_fees) {
    const ff = service.defi_fees;
    const fmtFee = (v: number) =>
      v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(2)}B` :
      v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;
    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>Protocol</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>30d Fees</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>1m Δ</th>
            </tr>
          </thead>
          <tbody>
            {ff.entries.map((e, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px" }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{e.name}</span>
                  <span style={{ display: "block", fontSize: 11, color: "#aaa", marginTop: 1 }}>
                    {e.category}{e.chains.length > 0 ? ` · ${e.chains.join(", ")}` : ""}
                  </span>
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, fontSize: 13, color: "#444" }}>
                  {fmtFee(e.total30d)}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right" }}>
                  {e.change_1m !== null ? (
                    <span style={{
                      display: "inline-block",
                      padding: "2px 7px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      background: e.change_1m >= 0 ? "#e6f7ee" : "#fff0f0",
                      color: e.change_1m >= 0 ? "#1a7a3a" : "#c0392b",
                    }}>
                      {e.change_1m >= 0 ? "+" : ""}{e.change_1m.toFixed(1)}%
                    </span>
                  ) : (
                    <span style={{ color: "#ccc", fontSize: 12 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          {ff.entries.length} protocols · sorted by 30d fees · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "cex-volume" && service.cex_volume) {
    const cv = service.cex_volume;
    const fmtVol = (v: number) =>
      v >= 1_000_000_000
        ? `$${(v / 1_000_000_000).toFixed(1)}B`
        : `$${(v / 1_000_000).toFixed(0)}M`;
    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>#</th>
              <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>Exchange</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>24h Volume</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>Trust</th>
            </tr>
          </thead>
          <tbody>
            {cv.exchanges.map((e) => (
              <tr key={e.rank} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", color: "#aaa", fontSize: 12, fontWeight: 500 }}>{e.rank}</td>
                <td style={{ padding: "7px 8px" }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{e.name}</span>
                  {e.year_established && (
                    <span style={{ display: "block", fontSize: 11, color: "#aaa", marginTop: 1 }}>
                      est. {e.year_established}{e.country ? ` · ${e.country}` : ""}
                    </span>
                  )}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, fontSize: 13, color: "#444" }}>
                  {fmtVol(e.volume_usd_24h)}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right" }}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 7px",
                    borderRadius: 10,
                    fontSize: 12,
                    fontWeight: 700,
                    background: e.trust_score >= 9 ? "#e6f7ee" : e.trust_score >= 7 ? "#fff8e6" : "#fff0f0",
                    color: e.trust_score >= 9 ? "#1a7a3a" : e.trust_score >= 7 ? "#b8750a" : "#c0392b",
                  }}>
                    {e.trust_score}/10
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          {cv.exchanges.length} exchanges · sorted by 24h spot volume · via CoinGecko
        </p>
      </div>
    );
  }

  if (service.service_type === "options-oi" && service.options_oi) {
    const oo = service.options_oi;
    const fmtOI = (v: number) =>
      v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(1)}B` : `$${(v / 1_000_000).toFixed(0)}M`;
    return (
      <div>
        {oo.assets.map((a) => (
          <div key={a.asset} style={{ marginBottom: 16, padding: 12, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{a.asset} Options</span>
              <span style={{ fontSize: 12, color: "#888" }}>spot ${a.price_usd.toLocaleString()}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
              <div>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total OI</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: "#222" }}>{fmtOI(a.total_oi_usd)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Put/Call Ratio</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: a.put_call_ratio >= 1.0 ? "#c0392b" : a.put_call_ratio <= 0.6 ? "#1a7a3a" : "#b8750a" }}>
                  {a.put_call_ratio}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Calls OI</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#1a7a3a" }}>{fmtOI(a.call_oi_usd)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Puts OI</div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#c0392b" }}>{fmtOI(a.put_oi_usd)}</div>
              </div>
            </div>
            {a.top_expiry && (
              <div style={{ marginTop: 8, padding: "4px 8px", background: "#f0f4ff", borderRadius: 6, fontSize: 12, color: "#4a5568" }}>
                Largest expiry: <strong>{a.top_expiry}</strong> — {fmtOI(a.top_expiry_oi_usd)} OI
              </div>
            )}
          </div>
        ))}
        <p style={{ marginTop: 4, fontSize: 12, color: "#888" }}>
          Live options OI · put/call ratio · via Deribit
        </p>
      </div>
    );
  }

  if (service.service_type === "options-max-pain" && service.options_max_pain) {
    const mp = service.options_max_pain;
    return (
      <div>
        {mp.assets.map((a) => {
          const dirColor = a.direction === "above" ? "#1a7a3a" : a.direction === "below" ? "#c0392b" : "#888";
          const dirLabel = a.direction === "above" ? "▲ above spot" : a.direction === "below" ? "▼ below spot" : "≈ at spot";
          return (
            <div key={a.asset} style={{ marginBottom: 16, padding: 12, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{a.asset} Max Pain</span>
                <span style={{ fontSize: 12, color: "#888" }}>expiry {a.expiry}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Max Pain Strike</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>${a.max_pain_strike.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Current Spot</div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>${a.spot_usd.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Distance</div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: dirColor }}>
                    {a.distance_pct > 0 ? "+" : ""}{a.distance_pct}% &nbsp;
                    <span style={{ fontSize: 11 }}>{dirLabel}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Expiry OI</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#555" }}>
                    {a.expiry_oi_contracts >= 1_000_000
                      ? `${(a.expiry_oi_contracts / 1_000_000).toFixed(1)}M`
                      : a.expiry_oi_contracts >= 1_000
                      ? `${(a.expiry_oi_contracts / 1_000).toFixed(0)}K`
                      : a.expiry_oi_contracts.toLocaleString()} {a.asset}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 10, padding: "6px 10px", background: "#f8f4ff", borderRadius: 6, fontSize: 12, color: "#5a4a8a" }}>
                Market makers are most profitable if {a.asset} expires near <strong>${a.max_pain_strike.toLocaleString()}</strong>
              </div>
            </div>
          );
        })}
        <p style={{ marginTop: 4, fontSize: 12, color: "#888" }}>
          Live max pain · dominant expiry by OI · via Deribit
        </p>
      </div>
    );
  }

  if (service.service_type === "btc-rainbow" && service.btc_rainbow) {
    const rb = service.btc_rainbow;
    const pct = (rb.ratio * 100).toFixed(1);
    const barWidth = Math.min(100, Math.max(2, (rb.ratio / 9) * 100));
    const overModel = rb.ratio >= 1;
    return (
      <div>
        <div style={{ marginBottom: 14, padding: 14, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
          {/* Band badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ background: rb.band.color, color: "#fff", padding: "4px 12px", borderRadius: 20, fontWeight: 700, fontSize: 13 }}>
              {rb.band.label}
            </div>
            <span style={{ fontSize: 12, color: "#888" }}>band {rb.band.index} of 9</span>
          </div>
          {/* Price grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 16px", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Current Price</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>${rb.current_price_usd.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Model Price</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#555" }}>${rb.model_price_usd.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>vs Model</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: overModel ? "#c0392b" : "#1a7a3a" }}>
                {pct}%
              </div>
            </div>
          </div>
          {/* Progress bar across rainbow gradient */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>Position on Rainbow</div>
            <div style={{ height: 10, borderRadius: 5, background: "linear-gradient(to right, #1a237e, #1565c0, #00838f, #2e7d32, #f9a825, #e65100, #bf360c, #b71c1c, #4a0000)", position: "relative" }}>
              <div style={{ position: "absolute", top: -3, left: `${barWidth}%`, transform: "translateX(-50%)", width: 16, height: 16, borderRadius: "50%", background: rb.band.color, border: "2px solid #fff", boxShadow: "0 0 4px rgba(0,0,0,0.3)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb", marginTop: 2 }}>
              <span>Fire Sale</span>
              <span>Fair Value</span>
              <span>Max Bubble</span>
            </div>
          </div>
          {/* Interpretation */}
          <div style={{ padding: "8px 12px", background: "#f8f4ff", borderRadius: 6, fontSize: 12, color: "#5a4a8a" }}>
            {rb.interpretation}
          </div>
        </div>
        <p style={{ marginTop: 4, fontSize: 12, color: "#888" }}>
          Power-law model · {rb.days_since_genesis.toLocaleString()} days since genesis · via CoinGecko
        </p>
      </div>
    );
  }

  if (service.service_type === "altcoin-season" && service.altcoin_season) {
    const as = service.altcoin_season;
    const signalColor = as.signal === "altcoin" ? "#e65100" : as.signal === "bitcoin" ? "#1565c0" : "#555";
    const signalBg = as.signal === "altcoin" ? "#fff3e0" : as.signal === "bitcoin" ? "#e3f2fd" : "#f5f5f5";
    const barWidth = Math.min(100, Math.max(2, as.score));
    const barColor = as.signal === "altcoin" ? "#e65100" : as.signal === "bitcoin" ? "#1565c0" : "#888";
    return (
      <div>
        <div style={{ marginBottom: 14, padding: 14, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
          {/* Signal badge + score */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ background: signalBg, color: signalColor, padding: "4px 14px", borderRadius: 20, fontWeight: 700, fontSize: 14, border: `1px solid ${signalColor}30` }}>
              {as.signal_label}
            </div>
          </div>
          {/* Score bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", marginBottom: 4 }}>
              <span>Bitcoin Season</span>
              <span style={{ fontWeight: 700, color: barColor, fontSize: 13 }}>{as.score} / 100</span>
              <span>Altcoin Season</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "#e8e8e8", position: "relative" }}>
              <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${barWidth}%`, borderRadius: 4, background: `linear-gradient(to right, #1565c0, #888, #e65100)`, clipPath: `inset(0 ${100 - barWidth}% 0 0)` }} />
              {/* threshold markers */}
              <div style={{ position: "absolute", left: "25%", top: -4, width: 1, height: 16, background: "#ccc" }} />
              <div style={{ position: "absolute", left: "75%", top: -4, width: 1, height: 16, background: "#ccc" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb", marginTop: 2 }}>
              <span>≤25</span>
              <span>neutral 26–74</span>
              <span>≥75</span>
            </div>
          </div>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 16px", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Alts vs BTC</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#222" }}>{as.outperforming}/{as.total_coins}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>BTC 30d</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: as.btc_change_30d_pct >= 0 ? "#1a7a3a" : "#c0392b" }}>
                {as.btc_change_30d_pct >= 0 ? "+" : ""}{as.btc_change_30d_pct}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Outperforming</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#222" }}>{as.score}%</div>
            </div>
          </div>
          {/* Top & bottom performers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#1a7a3a", marginBottom: 6 }}>Top Performers 30d</div>
              {as.top_performers.map((c) => (
                <div key={c.symbol} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ fontWeight: 600 }}>{c.symbol}</span>
                  <span style={{ color: "#1a7a3a" }}>+{c.change_30d_pct}%</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#c0392b", marginBottom: 6 }}>Worst Performers 30d</div>
              {as.bottom_performers.map((c) => (
                <div key={c.symbol} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "2px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <span style={{ fontWeight: 600 }}>{c.symbol}</span>
                  <span style={{ color: "#c0392b" }}>{c.change_30d_pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p style={{ marginTop: 4, fontSize: 12, color: "#888" }}>
          Top 50 non-stable coins · 30-day window · via CoinGecko
        </p>
      </div>
    );
  }

  if (service.service_type === "btc-mining" && service.btc_mining) {
    const bm = service.btc_mining;
    const adjColor = bm.difficulty_change_pct >= 0 ? "#c0392b" : "#1a7a3a";
    const adjLabel = bm.difficulty_change_pct >= 0 ? "harder" : "easier";
    const retargetDate = new Date(bm.estimated_retarget_date);
    const retargetStr = retargetDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return (
      <div>
        <div style={{ marginBottom: 14, padding: 14, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 16px", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Hashrate</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{bm.hashrate_eh.toLocaleString()} EH/s</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Next Adjustment</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: adjColor }}>
                {bm.difficulty_change_pct >= 0 ? "+" : ""}{bm.difficulty_change_pct}%
              </div>
              <div style={{ fontSize: 10, color: "#aaa" }}>{adjLabel}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Avg Block Time</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{bm.avg_block_time_sec}s</div>
              <div style={{ fontSize: 10, color: "#aaa" }}>target 600s</div>
            </div>
          </div>
          {/* Epoch progress bar */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#aaa", marginBottom: 4 }}>
              <span>Epoch progress</span>
              <span style={{ fontWeight: 600, color: "#555" }}>{bm.progress_pct}% · {bm.remaining_blocks.toLocaleString()} blocks remaining</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "#e8e8e8" }}>
              <div style={{ height: "100%", width: `${Math.min(100, bm.progress_pct)}%`, borderRadius: 4, background: "#1a7a3a" }} />
            </div>
          </div>
          {/* Retarget info row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 16px" }}>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Next Retarget</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#222" }}>~{retargetStr} ({bm.days_until_retarget}d)</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Block Height</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#222" }}>#{bm.next_retarget_height.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Prev Adjustment</div>
              <div style={{ fontWeight: 600, fontSize: 13, color: bm.prev_retarget_pct >= 0 ? "#c0392b" : "#1a7a3a" }}>
                {bm.prev_retarget_pct >= 0 ? "+" : ""}{bm.prev_retarget_pct}%
              </div>
            </div>
          </div>
        </div>
        <p style={{ marginTop: 4, fontSize: 12, color: "#888" }}>
          Hashrate + difficulty data · via mempool.space
        </p>
      </div>
    );
  }

  if (service.service_type === "bridge-volume" && service.bridge_volume) {
    const bv = service.bridge_volume;
    const fmtM = (v: number) => `$${(v / 1e6).toFixed(0)}M`;
    const fmtB = (v: number) => `$${(v / 1e9).toFixed(2)}B`;
    return (
      <div>
        <div style={{ marginBottom: 14, padding: 14, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
          {/* Summary row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total 24h Volume</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{fmtB(bv.total_24h_usd)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total 7d Volume</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#555" }}>{fmtB(bv.total_7d_usd)}</div>
            </div>
          </div>
          {/* Bridge rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {bv.bridges.map((b, i) => {
              const barPct = Math.round((b.volume_24h_usd / bv.bridges[0].volume_24h_usd) * 100);
              return (
                <div key={b.name} style={{ display: "grid", gridTemplateColumns: "18px 1fr 70px 60px 44px", gap: "0 8px", alignItems: "center" }}>
                  <div style={{ fontSize: 11, color: "#bbb", textAlign: "right" }}>{i + 1}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#222", marginBottom: 2 }}>{b.name}</div>
                    <div style={{ height: 4, borderRadius: 2, background: "#e8e8e8" }}>
                      <div style={{ height: "100%", width: `${barPct}%`, borderRadius: 2, background: "#2563eb" }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#222", textAlign: "right" }}>{fmtM(b.volume_24h_usd)}</div>
                  <div style={{ fontSize: 11, color: "#888", textAlign: "right" }}>{fmtM(b.volume_7d_usd)} 7d</div>
                  <div style={{ fontSize: 10, color: "#aaa", textAlign: "right" }}>{b.chains}c</div>
                </div>
              );
            })}
          </div>
        </div>
        <p style={{ marginTop: 4, fontSize: 12, color: "#888" }}>
          Top 10 bridges by 24h volume · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "tvl-movers" && service.tvl_movers) {
    const tm = service.tvl_movers;
    const fmtTvl = (v: number) =>
      v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const GainerRow = ({ e }: { e: TvlMoversData["gainers"][number] }) => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 72px 60px", gap: "0 8px", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f5f5f5" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#222" }}>{e.name}</div>
          <div style={{ fontSize: 10, color: "#aaa" }}>{e.category} · {e.chain}</div>
        </div>
        <div style={{ fontSize: 11, color: "#888", textAlign: "right" }}>{fmtTvl(e.tvl_usd)}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", textAlign: "right" }}>+{e.change_7d_pct.toFixed(1)}%</div>
        <div style={{ fontSize: 10, color: "#bbb", textAlign: "right" }}>7d</div>
      </div>
    );
    const LoserRow = ({ e }: { e: TvlMoversData["losers"][number] }) => (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 72px 60px", gap: "0 8px", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f5f5f5" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#222" }}>{e.name}</div>
          <div style={{ fontSize: 10, color: "#aaa" }}>{e.category} · {e.chain}</div>
        </div>
        <div style={{ fontSize: 11, color: "#888", textAlign: "right" }}>{fmtTvl(e.tvl_usd)}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", textAlign: "right" }}>{e.change_7d_pct.toFixed(1)}%</div>
        <div style={{ fontSize: 10, color: "#bbb", textAlign: "right" }}>7d</div>
      </div>
    );
    return (
      <div>
        <div style={{ marginBottom: 14, padding: "10px 14px", background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>
            Total DeFi TVL: <strong style={{ color: "#555" }}>${(tm.total_defi_tvl / 1e9).toFixed(1)}B</strong>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#16a34a", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>▲ Top Gainers</div>
              {tm.gainers.map((e) => <GainerRow key={e.name} e={e} />)}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#dc2626", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>▼ Top Losers</div>
              {tm.losers.map((e) => <LoserRow key={e.name} e={e} />)}
            </div>
          </div>
        </div>
        <p style={{ marginTop: 4, fontSize: 12, color: "#888" }}>
          7-day TVL change · protocols with TVL &gt; $100M · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "lightning-network" && service.lightning_network) {
    const ln = service.lightning_network;
    const fmtChange = (v: number, unit: string) =>
      `${v >= 0 ? "+" : ""}${v.toLocaleString()} ${unit}`;
    const changeColor = (v: number) => (v >= 0 ? "#16a34a" : "#dc2626");
    const Stat = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
      <div style={{ textAlign: "center", padding: "10px 8px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#222" }}>{value}</div>
        {sub && <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2 }}>{sub}</div>}
        <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{label}</div>
      </div>
    );
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <Stat
            label="Channels"
            value={ln.channel_count.toLocaleString()}
            sub={<span style={{ color: changeColor(ln.channel_count_change) }}>{fmtChange(ln.channel_count_change, "WoW")}</span> as unknown as string}
          />
          <Stat
            label="Nodes"
            value={ln.node_count.toLocaleString()}
            sub={<span style={{ color: changeColor(ln.node_count_change) }}>{fmtChange(ln.node_count_change, "WoW")}</span> as unknown as string}
          />
          <Stat
            label="Locked BTC"
            value={ln.total_capacity_btc.toFixed(0)}
            sub={<span style={{ color: changeColor(ln.capacity_change_btc) }}>{fmtChange(ln.capacity_change_btc, "BTC WoW")}</span> as unknown as string}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 10, color: "#aaa", marginBottom: 2 }}>Avg channel size</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>{(ln.avg_channel_btc * 100_000_000).toLocaleString()} sats</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 10, color: "#aaa", marginBottom: 2 }}>Avg fee rate</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>{ln.avg_fee_rate} ppm</div>
          </div>
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          {ln.tor_nodes.toLocaleString()} Tor nodes · WoW = week-over-week change · via mempool.space
        </p>
      </div>
    );
  }

  if (service.service_type === "eth-lst" && service.eth_lst) {
    const lst = service.eth_lst;
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>Token</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>APY</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>TVL</th>
            </tr>
          </thead>
          <tbody>
            {lst.tokens.map((t) => (
              <tr key={t.symbol} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px" }}>
                  <span style={{ fontWeight: 700 }}>{t.symbol}</span>
                  <span style={{ fontSize: 12, color: "#888", marginLeft: 6 }}>{t.project}</span>
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700, color: "#1a7a3a" }}>{t.apy.toFixed(2)}%</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600 }}>{fmtTvl(t.tvl_usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          {lst.tokens.length} ETH LSTs · Avg APY: {lst.avg_apy.toFixed(2)}% · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "realized-vol" && service.realized_vol) {
    const rv = service.realized_vol;
    const regimeColor = (r: string) => r === "escalating" ? "#d44" : r === "cooling" ? "#1a7a3a" : "#888";
    const regimeLabel = (r: string) => r === "escalating" ? "↑ Escalating" : r === "cooling" ? "↓ Cooling" : "→ Stable";
    return (
      <div>
        <div style={{ marginBottom: 10, padding: "8px 12px", background: "#f8f8f8", borderRadius: 8, border: "1px solid #e8e8e8", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#888", fontWeight: 600 }}>Market Regime</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: regimeColor(rv.market_regime) }}>{regimeLabel(rv.market_regime)}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>Asset</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>30d Vol</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>7d Vol</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>Regime</th>
            </tr>
          </thead>
          <tbody>
            {rv.assets.map((a) => (
              <tr key={a.symbol} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", fontWeight: 700 }}>{a.symbol}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600 }}>{a.vol_30d_pct.toFixed(1)}%</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600 }}>{a.vol_7d_pct.toFixed(1)}%</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700, color: regimeColor(a.regime) }}>{regimeLabel(a.regime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Annualized realized vol from daily log returns · 7d vs 30d comparison · via CoinGecko
        </p>
      </div>
    );
  }

  if (service.service_type === "lending-rates" && service.lending_rates) {
    const lr = service.lending_rates;
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const fmtProtocol = (p: string) => p.replace(/-v[0-9]+$/, (m) => m.toUpperCase().replace("-", " "));
    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1, padding: "8px 12px", background: "#f0faf4", borderRadius: 8, border: "1px solid #c8e6d0" }}>
            <div style={{ fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 2 }}>Best Stablecoin</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a7a3a" }}>{lr.best_stable_apy.toFixed(2)}% APY</div>
            <div style={{ fontSize: 11, color: "#888" }}>{fmtProtocol(lr.best_stable_protocol)}</div>
          </div>
          <div style={{ flex: 1, padding: "8px 12px", background: "#f0f4ff", borderRadius: 8, border: "1px solid #c8d5f0" }}>
            <div style={{ fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 2 }}>Best ETH</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#2a50a0" }}>{lr.best_eth_apy.toFixed(2)}% APY</div>
            <div style={{ fontSize: 11, color: "#888" }}>{fmtProtocol(lr.best_eth_protocol)}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "5px 8px", textAlign: "left", fontSize: 11, color: "#888", fontWeight: 600 }}>Protocol</th>
              <th style={{ padding: "5px 8px", textAlign: "left", fontSize: 11, color: "#888", fontWeight: 600 }}>Asset</th>
              <th style={{ padding: "5px 8px", textAlign: "left", fontSize: 11, color: "#888", fontWeight: 600 }}>Chain</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>Supply APY</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>TVL</th>
            </tr>
          </thead>
          <tbody>
            {lr.pools.map((p, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "5px 8px", fontWeight: 600 }}>{fmtProtocol(p.protocol)}</td>
                <td style={{ padding: "5px 8px", fontWeight: 700 }}>{p.symbol}</td>
                <td style={{ padding: "5px 8px", color: "#666" }}>{p.chain}</td>
                <td style={{ padding: "5px 8px", textAlign: "right", fontWeight: 700, color: "#1a7a3a" }}>{p.supply_apy.toFixed(2)}%</td>
                <td style={{ padding: "5px 8px", textAlign: "right", color: "#888" }}>{fmtTvl(p.tvl_usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Supply APY from on-chain lending markets · Aave v3, Compound v3, Maple &amp; more · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "protocol-revenue" && service.protocol_revenue) {
    const pr = service.protocol_revenue;
    const fmtRev = (v: number) =>
      v >= 1_000_000_000 ? `$${(v / 1_000_000_000).toFixed(2)}B` :
      v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;
    return (
      <div>
        <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
          Revenue = fees kept by the protocol (treasury + token holders), not total user fees
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>Protocol</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>30d Revenue</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>1m Δ</th>
            </tr>
          </thead>
          <tbody>
            {pr.entries.map((e, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px" }}>
                  <span style={{ fontWeight: 500, fontSize: 13 }}>{e.name}</span>
                  <span style={{ display: "block", fontSize: 11, color: "#aaa", marginTop: 1 }}>
                    {e.category}{e.chains.length > 0 ? ` · ${e.chains.join(", ")}` : ""}
                  </span>
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, fontSize: 13, color: "#444" }}>
                  {fmtRev(e.revenue_30d)}
                </td>
                <td style={{ padding: "7px 8px", textAlign: "right" }}>
                  {e.change_1m !== null ? (
                    <span style={{
                      display: "inline-block",
                      padding: "2px 7px",
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 700,
                      background: e.change_1m >= 0 ? "#e6f7ee" : "#fff0f0",
                      color: e.change_1m >= 0 ? "#1a7a3a" : "#c0392b",
                    }}>
                      {e.change_1m >= 0 ? "+" : ""}{e.change_1m.toFixed(1)}%
                    </span>
                  ) : (
                    <span style={{ color: "#ccc", fontSize: 12 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          {pr.entries.length} protocols · sorted by 30d revenue · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "btc-onchain" && service.btc_onchain) {
    const bo = service.btc_onchain;
    const fmtUsd = (v: number) =>
      v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${v.toLocaleString()}`;
    const blocksColor = bo.blocks_mined_24h < 130 ? "#c0392b" : bo.blocks_mined_24h > 158 ? "#c0392b" : "#1a7a3a";
    return (
      <div>
        <div style={{ marginBottom: 14, padding: 14, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
          {/* Top row: transactions + volume */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Transactions (24h)</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{bo.tx_count_24h.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>USD Transferred (24h)</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{fmtUsd(bo.tx_volume_usd)}</div>
            </div>
          </div>
          {/* Bottom row: blocks, avg tx value, miner revenue */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px 16px" }}>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Blocks Mined</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: blocksColor }}>{bo.blocks_mined_24h}</div>
              <div style={{ fontSize: 10, color: "#aaa" }}>target 144/day</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Avg Tx Value</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{fmtUsd(bo.avg_tx_value_usd)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Block Subsidy</div>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#222" }}>{fmtUsd(bo.subsidy_revenue_usd)}</div>
              <div style={{ fontSize: 10, color: "#aaa" }}>3.125 BTC/block</div>
            </div>
          </div>
        </div>
        <p style={{ marginTop: 4, fontSize: 12, color: "#888" }}>
          On-chain activity · via blockchain.com
        </p>
      </div>
    );
  }

  if (service.service_type === "nft-market" && service.nft_market) {
    const nm = service.nft_market;
    const fmtUsd = (v: number) =>
      v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(1)}K` : `$${v.toLocaleString()}`;
    const changeColor = (pct: number) => (pct >= 0 ? "#1a7a3a" : "#c0392b");
    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 8px", color: "#aaa", fontWeight: 500 }}>Collection</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#aaa", fontWeight: 500 }}>Floor (ETH)</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#aaa", fontWeight: 500 }}>Floor (USD)</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#aaa", fontWeight: 500 }}>24h Change</th>
              <th style={{ textAlign: "right", padding: "4px 8px", color: "#aaa", fontWeight: 500 }}>24h Vol</th>
            </tr>
          </thead>
          <tbody>
            {nm.collections.map((c) => (
              <tr key={c.symbol} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "6px 8px", fontWeight: 600, color: "#222" }}>{c.name}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", color: "#555" }}>{c.floor_price_eth.toFixed(2)} ETH</td>
                <td style={{ padding: "6px 8px", textAlign: "right", color: "#222", fontWeight: 500 }}>{fmtUsd(c.floor_price_usd)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600, color: changeColor(c.change_24h_pct) }}>
                  {c.change_24h_pct >= 0 ? "+" : ""}{c.change_24h_pct.toFixed(1)}%
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right", color: "#555" }}>{fmtUsd(c.volume_24h_usd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          {nm.collections.length} collections · sorted by 24h volume · via CoinGecko
        </p>
      </div>
    );
  }

  if (service.service_type === "market-breadth" && service.market_breadth) {
    const mb = service.market_breadth;
    const changeColor = (pct: number) => (pct >= 0 ? "#1a7a3a" : "#c0392b");
    const regimeLabel = mb.breadth_score >= 70 ? "Broad Rally" : mb.breadth_score >= 55 ? "Moderate Advance" : mb.breadth_score >= 45 ? "Mixed" : mb.breadth_score >= 30 ? "Moderate Decline" : "Broad Sell-off";
    const regimeColor = mb.breadth_score >= 55 ? "#1a7a3a" : mb.breadth_score >= 45 ? "#888" : "#c0392b";
    return (
      <div>
        {/* Summary row */}
        <div style={{ marginBottom: 14, padding: 14, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px 16px", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Breadth Score</div>
              <div style={{ fontWeight: 700, fontSize: 22, color: regimeColor }}>{mb.breadth_score}</div>
              <div style={{ fontSize: 10, color: regimeColor, fontWeight: 600 }}>{regimeLabel}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Advancing</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#1a7a3a" }}>{mb.advancing}</div>
              <div style={{ fontSize: 10, color: "#aaa" }}>of {mb.total} coins</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Declining</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#c0392b" }}>{mb.declining}</div>
              <div style={{ fontSize: 10, color: "#aaa" }}>of {mb.total} coins</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Neutral</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#888" }}>{mb.neutral}</div>
              <div style={{ fontSize: 10, color: "#aaa" }}>±0.5%</div>
            </div>
          </div>
          {/* Breadth bar */}
          <div style={{ height: 8, borderRadius: 4, background: "#eee", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${mb.breadth_score}%`, background: mb.breadth_score >= 55 ? "#1a7a3a" : mb.breadth_score >= 45 ? "#f0a500" : "#c0392b", borderRadius: 4 }} />
          </div>
        </div>
        {/* Gainers + Losers side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Top Gainers</div>
            {mb.top_gainers.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < mb.top_gainers.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                <span style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{c.symbol}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: changeColor(c.change_24h_pct) }}>+{c.change_24h_pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Top Losers</div>
            {mb.top_losers.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < mb.top_losers.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                <span style={{ fontSize: 13, color: "#333", fontWeight: 500 }}>{c.symbol}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: changeColor(c.change_24h_pct) }}>{c.change_24h_pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: "#888" }}>
          Top 100 coins by market cap · advance/decline breadth · via CoinGecko
        </p>
      </div>
    );
  }

  if (service.service_type === "perp-oi" && service.perp_oi) {
    const po = service.perp_oi;
    const fmtUsd = (v: number) =>
      v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toLocaleString()}`;
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0", display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Top-10 Total OI</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#222" }}>{fmtUsd(po.total_oi_usd)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total OI (BTC)</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{po.total_oi_btc.toLocaleString()} BTC</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>BTC Price</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>${po.btc_price.toLocaleString()}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>#</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Exchange</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Open Interest</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>24h Volume</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Perps</th>
            </tr>
          </thead>
          <tbody>
            {po.exchanges.map((ex, i) => (
              <tr key={ex.name} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "5px 6px", color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                <td style={{ padding: "5px 6px", fontWeight: 600, color: "#222" }}>{ex.name}</td>
                <td style={{ padding: "5px 6px", textAlign: "right", color: "#222", fontWeight: 500 }}>{fmtUsd(ex.oi_usd)}</td>
                <td style={{ padding: "5px 6px", textAlign: "right", color: "#555" }}>{fmtUsd(ex.vol_24h_usd)}</td>
                <td style={{ padding: "5px 6px", textAlign: "right", color: "#888" }}>{ex.perp_pairs}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Top {po.exchanges.length} perp exchanges by open interest · via CoinGecko
        </p>
      </div>
    );
  }

  if (service.service_type === "stablecoin-chains" && service.stablecoin_chains) {
    const sc = service.stablecoin_chains;
    const fmtUsd = (v: number) =>
      v >= 1e12 ? `$${(v / 1e12).toFixed(2)}T` :
      v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` :
      v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toLocaleString()}`;
    const maxTvl = sc.chains[0]?.tvl_usd ?? 1;
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0", display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Top-12 Total</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#222" }}>{fmtUsd(sc.total_usd)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Dominant Chain</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{sc.top_chain} ({sc.top_chain_pct}%)</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Chains Covered</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{sc.chains.length}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>#</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Chain</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Stablecoin TVL</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Share</th>
              <th style={{ textAlign: "left", padding: "4px 14px", color: "#aaa", fontWeight: 500 }}>Distribution</th>
            </tr>
          </thead>
          <tbody>
            {sc.chains.map((c, i) => (
              <tr key={c.name} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "5px 6px", color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                <td style={{ padding: "5px 6px", fontWeight: 600, color: "#222" }}>{c.name}</td>
                <td style={{ padding: "5px 6px", textAlign: "right", color: "#222", fontWeight: 500 }}>{fmtUsd(c.tvl_usd)}</td>
                <td style={{ padding: "5px 6px", textAlign: "right", color: "#555" }}>{c.pct_of_total}%</td>
                <td style={{ padding: "5px 14px" }}>
                  <div style={{ background: "#f0f0f0", borderRadius: 3, height: 8, width: 100 }}>
                    <div style={{ background: "#6366f1", borderRadius: 3, height: 8, width: `${Math.round((c.tvl_usd / maxTvl) * 100)}%` }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Top {sc.chains.length} chains by stablecoin TVL · via DeFi Llama
        </p>
      </div>
    );
  }

  return <p style={{ color: "#555", fontSize: 14 }}>{service.result}</p>;
}

// ---------------------------------------------------------------------------
// Agent Discovery Panel — demonstrates ERC-8004-inspired /.well-known/agent.json
// ---------------------------------------------------------------------------
function AgentDiscoveryPanel() {
  const [discoveryState, setDiscoveryState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "done"; data: Record<string, unknown> }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const fetchAgentJson = async () => {
    setDiscoveryState({ status: "loading" });
    try {
      const res = await fetch("/.well-known/agent.json");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as Record<string, unknown>;
      setDiscoveryState({ status: "done", data });
    } catch (e) {
      setDiscoveryState({ status: "error", message: String(e) });
    }
  };

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: 10,
        padding: "18px 20px",
        marginTop: 16,
      }}
    >
      <h3 style={{ margin: "0 0 8px 0", fontSize: 15, fontWeight: 700 }}>
        Agent Discovery
      </h3>
      <p style={{ margin: "0 0 14px 0", fontSize: 13, color: "#555", lineHeight: 1.5 }}>
        AI agents discover this service via the{" "}
        <code style={{ background: "#f0f0f0", padding: "1px 5px", borderRadius: 3, fontSize: 12 }}>
          /.well-known/agent.json
        </code>{" "}
        endpoint — inspired by{" "}
        <a
          href="https://eips.ethereum.org/EIPS/eip-8004"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#2244aa" }}
        >
          ERC-8004
        </a>
        . It lists all capabilities, pricing, and payment methods in a machine-readable format.
      </p>

      <button
        onClick={fetchAgentJson}
        disabled={discoveryState.status === "loading"}
        style={{
          padding: "7px 16px",
          background: discoveryState.status === "done" ? "#e8f5e9" : "#2244aa",
          color: discoveryState.status === "done" ? "#1b5e20" : "white",
          border: "none",
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 600,
          cursor: discoveryState.status === "loading" ? "default" : "pointer",
          opacity: discoveryState.status === "loading" ? 0.7 : 1,
        }}
      >
        {discoveryState.status === "loading"
          ? "Fetching…"
          : discoveryState.status === "done"
          ? "✓ Fetched"
          : "GET /.well-known/agent.json"}
      </button>

      {discoveryState.status === "done" && (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              background: "#f8f9fa",
              border: "1px solid #e0e0e0",
              borderRadius: 6,
              padding: "12px 14px",
              fontFamily: "monospace",
              fontSize: 12,
              color: "#333",
              whiteSpace: "pre-wrap",
              maxHeight: 320,
              overflowY: "auto",
            }}
          >
            {JSON.stringify(discoveryState.data, null, 2)}
          </div>
          <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
            An agent can parse this JSON to discover available services, pricing, and payment endpoint — no human needed.
          </p>
        </div>
      )}

      {discoveryState.status === "error" && (
        <p style={{ marginTop: 10, fontSize: 13, color: "#c00" }}>
          Error: {discoveryState.message}
        </p>
      )}
    </div>
  );
}

export default function PaymentFlow() {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [activeProtocol, setActiveProtocol] = useState<"solana" | "x402">("solana");
  const [state, setState] = useState<PaymentState>({ status: "idle" });
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [tourStep, setTourStep] = useState<number>(-1);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>("crypto-prices");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>("All");
  const [showCode, setShowCode] = useState(false);
  const [preview, setPreview] = useState<PreviewState>({ status: "idle" });
  const [countdown, setCountdown] = useState<number | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch health status on mount
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data: HealthStatus) => setHealth(data))
      .catch(() => setHealth(null));
  }, []);

  // Reset preview when service selection changes
  useEffect(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setCountdown(null);
    setPreview({ status: "idle" });
  }, [selectedService]);

  // Auto-refresh live preview every 30s when data is shown
  useEffect(() => {
    if (preview.status !== "ready") {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setCountdown(null);
      return;
    }

    const REFRESH_SEC = 30;
    setCountdown(REFRESH_SEC);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 1 ? prev - 1 : null));
    }, 1000);

    refreshTimerRef.current = setTimeout(() => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setPreview({ status: "loading" });
      fetch(`/api/preview?service=${selectedService}`)
        .then((r) => (r.ok ? r.json() : r.json().then((d: { error?: string }) => Promise.reject(new Error(d.error || "Preview fetch failed")))))
        .then((data: ServiceResult) => setPreview({ status: "ready", service: data }))
        .catch((err: Error) => setPreview({ status: "error", message: err.message }));
    }, REFRESH_SEC * 1000);

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [preview.status, selectedService]);

  const handlePay = async () => {
    if (!publicKey || !signTransaction) return;

    try {
      // Step 1: Request invoice + unsigned transaction from server
      setState({ status: "building" });
      const invoiceRes = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userWallet: publicKey.toBase58(), serviceType: selectedService }),
      });

      if (!invoiceRes.ok) {
        const { error } = await invoiceRes.json();
        throw new Error(error || "Failed to build invoice");
      }

      const { transaction: txBase64, invoiceParams } = (await invoiceRes.json()) as {
        transaction: string;
        invoiceParams: InvoiceParams;
      };

      // Step 2: Sign and submit (wallet prompts user to approve)
      setState({ status: "signing" });
      const signature = await signAndSubmitTransaction(txBase64, signTransaction, connection);

      // Step 3: Wait for on-chain confirmation
      setState({ status: "confirming" });
      await awaitConfirmation(signature, connection);

      // Step 4: Server-side verification + service delivery
      setState({ status: "verifying" });
      const verifyRes = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userWallet: publicKey.toBase58(),
          invoiceParams,
          signature,
          serviceType: selectedService,
        }),
      });

      if (!verifyRes.ok) {
        const { message } = await verifyRes.json();
        throw new Error(message || "Payment verification failed");
      }

      const { service } = (await verifyRes.json()) as { service: ServiceResult };
      setState({ status: "success", service, signature });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  /** Runs an animated tour of the payment flow states.
   *  Pre-fetches live data from /api/preview so the success step shows real values. */
  const runTour = async () => {
    if (isTourRunning) return;

    // Try to fetch live data to use in the tour's success step.
    // If this fails, we fall back to hardcoded MOCK_* constants.
    let liveData: ServiceResult | undefined;
    try {
      const res = await fetch(`/api/preview?service=${selectedService}`);
      if (res.ok) {
        const d = (await res.json()) as ServiceResult;
        // Override delivered_to so the tour success state looks like a real delivery
        liveData = { ...d, delivered_to: "Demo1234...abcd" };
      }
    } catch {
      // Silently fall back to mock data
    }

    const tourSteps = buildTourSteps(selectedService, liveData);
    setIsTourRunning(true);
    setTourStep(0);

    for (let i = 0; i < tourSteps.length; i++) {
      setTourStep(i);
      setState(tourSteps[i]);
      const delay = i === tourSteps.length - 1 ? 0 : 1200;
      if (delay > 0) await new Promise((r) => setTimeout(r, delay));
    }

    setIsTourRunning(false);
    setTourStep(-1);
  };

  const resetTour = () => {
    setState({ status: "idle" });
    setTourStep(-1);
    setIsTourRunning(false);
  };

  const fetchLivePreview = async () => {
    if (preview.status === "loading") return;
    setPreview({ status: "loading" });
    try {
      const res = await fetch(`/api/preview?service=${selectedService}`);
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Preview fetch failed");
      }
      const data = await res.json() as ServiceResult;
      setPreview({ status: "ready", service: data });
    } catch (err) {
      setPreview({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const statusLabel: Record<string, string> = {
    idle: "Pay 1 USDC",
    building: "Building transaction...",
    signing: "Sign in wallet...",
    confirming: "Confirming on-chain...",
    verifying: "Verifying payment...",
  };

  const isLoading = ["building", "signing", "confirming", "verifying"].includes(
    state.status
  );

  const notConfigured = health && !health.ready;
  const tourStepCount = buildTourSteps(selectedService).length;
  const selectedOption = SERVICE_OPTIONS.find(o => o.id === selectedService);

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", fontFamily: "system-ui, sans-serif", padding: "0 16px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 6, fontWeight: 700 }}>
        Tokenized Agent Payments Demo
      </h1>
      <p style={{ color: "#555", marginBottom: 16, fontSize: 15 }}>
        Select a service and a payment protocol. Data is delivered only after payment is verified on-chain.
      </p>

      {/* Protocol selector */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 8 }}>
          Payment protocol:
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {(["solana", "x402"] as const).map((proto) => {
            const isActive = activeProtocol === proto;
            const label =
              proto === "solana" ? "Solana · pump.fun" : "EVM · x402 (Base)";
            const desc =
              proto === "solana"
                ? "SPL token payment, on-chain verification"
                : "HTTP 402 micropayment, USDC on Base Sepolia";
            return (
              <button
                key={proto}
                onClick={() => setActiveProtocol(proto)}
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  background: isActive ? "#2244aa" : "#f5f7ff",
                  color: isActive ? "white" : "#444",
                  border: `2px solid ${isActive ? "#2244aa" : "#dde4f0"}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 3,
                    color: isActive ? "rgba(255,255,255,0.8)" : "#888",
                  }}
                >
                  {desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Service selector */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 8 }}>
          Choose a service:
        </p>

        {/* Category tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {SERVICE_CATEGORIES.map((cat) => {
            const count = cat === "All" ? SERVICE_OPTIONS.length : SERVICE_OPTIONS.filter(o => o.category === cat).length;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  if (!isTourRunning && !isLoading) {
                    setSelectedCategory(cat);
                    // Auto-select first service in the new category if current selection isn't in it
                    const filtered = cat === "All" ? SERVICE_OPTIONS : SERVICE_OPTIONS.filter(o => o.category === cat);
                    if (filtered.length > 0 && !filtered.find(o => o.id === selectedService)) {
                      setSelectedService(filtered[0].id);
                      if (state.status !== "idle") resetTour();
                      setPreview({ status: "idle" });
                    }
                  }
                }}
                disabled={isTourRunning || isLoading}
                style={{
                  padding: "4px 10px",
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#fff" : "#444",
                  background: isActive ? "#2244aa" : "#eee",
                  border: "none",
                  borderRadius: 20,
                  cursor: isTourRunning || isLoading ? "not-allowed" : "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {cat} <span style={{ opacity: 0.75 }}>({count})</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SERVICE_OPTIONS.filter(opt => selectedCategory === "All" || opt.category === selectedCategory).map((opt) => (
            <label
              key={opt.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 14px",
                background: selectedService === opt.id ? "#e8f0ff" : "#f5f5f5",
                border: selectedService === opt.id ? "1.5px solid #2244aa" : "1.5px solid transparent",
                borderRadius: 8,
                cursor: isTourRunning || isLoading ? "not-allowed" : "pointer",
                transition: "background 0.15s, border-color 0.15s",
              }}
              onClick={() => {
                if (!isTourRunning && !isLoading) {
                  setSelectedService(opt.id);
                  if (state.status !== "idle") resetTour();
                  setPreview({ status: "idle" });
                }
              }}
            >
              <input
                type="radio"
                name="service"
                value={opt.id}
                checked={selectedService === opt.id}
                onChange={() => {}}
                style={{ marginTop: 2 }}
              />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#222" }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{opt.description}</div>
                <div style={{ fontSize: 11, color: "#2244aa", marginTop: 3, fontWeight: 600 }}>
                  {opt.price}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* x402 / EVM demo panel */}
      {activeProtocol === "x402" && (
        <X402DemoPanel
          selectedService={selectedService}
          selectedLabel={selectedOption?.label ?? selectedService}
        />
      )}

      {/* Agent Discovery panel — only on x402 tab */}
      {activeProtocol === "x402" && <AgentDiscoveryPanel />}

      {/* Solana / pump.fun flow */}
      {activeProtocol === "solana" && (<>

      {/* Configuration warning banner */}
      {notConfigured && (
        <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13 }}>
          <strong style={{ color: "#7b5800" }}>⚠ Not fully configured</strong>
          <ul style={{ margin: "6px 0 0 0", paddingLeft: 18, color: "#5d4200" }}>
            {health.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
          <p style={{ margin: "8px 0 0 0", color: "#777" }}>
            Payments will fail until resolved. Use the{" "}
            <strong>Preview tour</strong> below to see how the flow works.
          </p>
        </div>
      )}

      {/* Demo tour section */}
      <div style={{ background: "#f0f4ff", borderRadius: 8, padding: "12px 14px", marginBottom: 24, fontSize: 13 }}>
        <strong style={{ color: "#2244aa" }}>Preview the payment flow</strong>
        <p style={{ margin: "4px 0 10px 0", color: "#555" }}>
          No wallet needed — animated walkthrough for <strong>{selectedOption?.label}</strong>.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            onClick={runTour}
            disabled={isTourRunning}
            style={{
              padding: "7px 16px",
              background: isTourRunning ? "#aaa" : "#2244aa",
              color: "white",
              border: "none",
              borderRadius: 5,
              fontSize: 13,
              cursor: isTourRunning ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {isTourRunning ? "Playing..." : "▶ Run Preview Tour"}
          </button>
          {(isTourRunning || state.status !== "idle") && (
            <button
              onClick={resetTour}
              style={{
                padding: "7px 14px",
                background: "white",
                color: "#555",
                border: "1px solid #ccc",
                borderRadius: 5,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          )}
          <button
            onClick={() => setShowCode((v) => !v)}
            style={{
              padding: "7px 14px",
              background: showCode ? "#0d1520" : "white",
              color: showCode ? "#7eb8f7" : "#444",
              border: showCode ? "1px solid #2244aa" : "1px solid #ccc",
              borderRadius: 5,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'SF Mono', 'Fira Code', monospace",
            }}
          >
            {showCode ? "{ } Hide code" : "{ } Show code"}
          </button>
          <button
            onClick={fetchLivePreview}
            disabled={preview.status === "loading"}
            title="Fetch live data from the same sources used post-payment — no wallet needed"
            style={{
              padding: "7px 14px",
              background: preview.status === "ready" ? "#d4edda" : "white",
              color: preview.status === "ready" ? "#155724" : preview.status === "loading" ? "#aaa" : "#1a7a3e",
              border: `1px solid ${preview.status === "ready" ? "#a8d5b5" : preview.status === "loading" ? "#ddd" : "#a8d5b5"}`,
              borderRadius: 5,
              fontSize: 13,
              cursor: preview.status === "loading" ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            {preview.status === "loading" ? "Fetching..." : preview.status === "ready" ? "✓ Live data" : "⚡ Fetch live data"}
          </button>
        </div>

        {/* Tour progress indicator */}
        {isTourRunning && (
          <div style={{ display: "flex", gap: 6, marginTop: 10, alignItems: "center" }}>
            {Array.from({ length: tourStepCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: i <= tourStep ? "#2244aa" : "#ccc",
                  transition: "background 0.3s",
                }}
              />
            ))}
            <span style={{ fontSize: 11, color: "#888", marginLeft: 4 }}>
              {tourStep >= 0 && tourStep < tourStepCount - 1
                ? `Step ${tourStep + 1}/${tourStepCount}`
                : "Complete"}
            </span>
          </div>
        )}

        {/* Developer code panel */}
        {showCode && <CodePanel status={state.status} />}

        {/* Live data preview result */}
        {preview.status === "error" && (
          <div style={{ marginTop: 12, padding: "8px 12px", background: "#fff0f0", borderRadius: 6, color: "#c00", fontSize: 12 }}>
            Preview error: {preview.message}
          </div>
        )}
        {preview.status === "ready" && (
          <div style={{ marginTop: 12, borderRadius: 6, overflow: "hidden", border: "1px solid #a8d5b5" }}>
            <div style={{
              background: "#d4edda",
              padding: "6px 12px",
              color: "#155724",
              fontWeight: 600,
              fontSize: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span>Live data sample — {selectedOption?.label}</span>
              <span style={{ fontSize: 10, fontWeight: 400, background: "#a8d5b5", padding: "2px 7px", borderRadius: 4 }}>
                Free preview · {new Date(preview.service.timestamp).toLocaleTimeString()}
                {countdown !== null ? ` · refreshes in ${countdown}s` : ""}
              </span>
            </div>
            <div style={{ background: "#f9fffe", padding: 12 }}>
              <ServiceResultTable service={preview.service} />
            </div>
          </div>
        )}
      </div>

      {/* Live payment section */}
      <div style={{ marginBottom: 24 }}>
        <WalletMultiButton />
      </div>

      {connected && (
        <div>
          <p style={{ fontSize: 13, color: "#666", marginBottom: 16 }}>
            Wallet: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-4)}
          </p>

          <button
            onClick={handlePay}
            disabled={isLoading || state.status === "success" || isTourRunning}
            style={{
              padding: "12px 24px",
              background: isLoading ? "#aaa" : state.status === "success" ? "#2d8653" : "#0052cc",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              cursor: isLoading ? "not-allowed" : "pointer",
              width: "100%",
              fontWeight: 600,
            }}
          >
            {isLoading
              ? statusLabel[state.status] || "Processing..."
              : state.status === "success"
              ? "Paid — Data Delivered"
              : `${statusLabel.idle} for ${selectedOption?.label}`}
          </button>

          {isLoading && (
            <p style={{ fontSize: 13, color: "#888", marginTop: 8, textAlign: "center" }}>
              {state.status === "building" && "Generating invoice..."}
              {state.status === "signing" && "Check your wallet for the approval prompt."}
              {state.status === "confirming" && "Waiting for Solana confirmation (10-30s)..."}
              {state.status === "verifying" && "Verifying payment on-chain..."}
            </p>
          )}

          {state.status === "error" && (
            <div style={{ marginTop: 16, padding: 12, background: "#fff0f0", borderRadius: 6, color: "#c00" }}>
              <strong>Error:</strong> {state.message}
              <br />
              <button
                onClick={() => setState({ status: "idle" })}
                style={{ marginTop: 8, fontSize: 13, color: "#0052cc", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Success state */}
      {state.status === "success" && (
        <div style={{ marginTop: 16, borderRadius: 8, overflow: "hidden", border: "1px solid #c3e6cb" }}>
          <div style={{ background: "#d4edda", padding: "10px 14px", color: "#155724", fontWeight: 600, fontSize: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Payment verified — data delivered</span>
            {state.signature === MOCK_SIGNATURE && (
              <span style={{ fontSize: 11, fontWeight: 400, background: "#a8d5b5", padding: "2px 7px", borderRadius: 4 }}>
                Preview mode
              </span>
            )}
          </div>
          <div style={{ background: "#f9fffe", padding: 14 }}>
            <ServiceResultTable service={state.service} />
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 10, marginBottom: 0 }}>
              Delivered to {state.service.delivered_to} &middot; {new Date(state.service.timestamp).toLocaleTimeString()}
            </p>
            {state.signature !== MOCK_SIGNATURE && (
              <p style={{ fontSize: 11, color: "#bbb", wordBreak: "break-all", marginTop: 4, marginBottom: 0 }}>
                Tx:{" "}
                <a
                  href={`https://solscan.io/tx/${state.signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#7eb8f7", textDecoration: "none" }}
                >
                  {state.signature.slice(0, 16)}...{state.signature.slice(-8)}
                </a>
                {" · "}
                <a
                  href={`https://explorer.solana.com/tx/${state.signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#7eb8f7", textDecoration: "none" }}
                >
                  Solana Explorer
                </a>
              </p>
            )}
          </div>
        </div>
      )}
      </>)}
    </div>
  );
}
