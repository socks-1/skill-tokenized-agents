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

  return <p style={{ color: "#555", fontSize: 14 }}>{service.result}</p>;
}

export default function PaymentFlow() {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();
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
        Pump Tokenized Agent Demo
      </h1>
      <p style={{ color: "#555", marginBottom: 16, fontSize: 15 }}>
        Select a service, connect your wallet, and pay 1 USDC. Data is delivered only after payment is verified on-chain.
      </p>

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
    </div>
  );
}
