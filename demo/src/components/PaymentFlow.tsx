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
  StablecoinPegsData,
  StablecoinPegEntry,
  MiningPoolsData,
  MiningPoolEntry,
  CryptoFundingData,
  FundingRoundEntry,
  ChainFeesData,
  ChainFeeEntry,
  ChainTvlData,
  ChainTvlEntry,
  DefiExploitsData,
  DefiExploitEntry,
  GlobalDexData,
  GlobalDexEntry,
  FuturesBasisData,
  FuturesBasisEntry,
  DexAggregatorEntry,
  DexAggregatorsData,
  MemeCoinEntry,
  MemeCoinsData,
  CrossChainGasEntry,
  CrossChainGasData,
  HlPairEntry,
  HlTopPairsData,
  EthBeaconData,
  RestakingProtocolEntry,
  RestakingData,
  BtcHalvingEntry,
  BtcHalvingData,
  SolValidatorEntry,
  SolValidatorsData,
  StableYieldEntry,
  StableYieldsData,
  BtcTreasuryCompany,
  BtcTreasuryData,
  EthBlobData,
  EthSupplyData,
  DaoGovernanceData,
  CryptoCorrelationData,
  ChainDevData,
  ChainDevEntry,
  ImpliedVolData,
  AthDistanceData,
  DerivOverviewData,
  DerivAssetStats,
  MacroSignalsData,
  MacroAssetData,
  SolPriorityFeeData,
  SuiNetworkData,
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
  {
    id: "stablecoin-pegs",
    label: "Stablecoin Peg Health Monitor",
    description: "Live peg health for top USD stablecoins — price deviation from $1, circulating supply, and depeg status. Covers USDT, USDC, USDS, USDe, DAI, and more. Flags warnings and depegs in real-time.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "mining-pools",
    label: "BTC Mining Pool Distribution",
    description: "Bitcoin mining pool share over the last 3 days — block count per pool, hashrate share %, network hashrate in EH/s, and the Nakamoto coefficient (min pools needed to reach 51% of blocks).",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "rwa-tvl",
    label: "RWA On-Chain Stats",
    description: "Real World Asset tokenization metrics — total RWA TVL on-chain, top protocols by TVL (tokenized treasuries, credit, real estate), 7-day growth rates, and dominant chain. Covers Ondo Finance, Maple, Centrifuge, and more.",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "crypto-funding",
    label: "Crypto VC Funding",
    description: "Recent crypto venture capital funding rounds — top deals by amount raised in the last 30 days, round types (Seed/Series A/B), lead investors, and category breakdown (DeFi, Infrastructure, AI, CEX). Via DeFi Llama.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "chain-fees",
    label: "Blockchain Fee Revenue",
    description: "Daily fee revenue rankings for top blockchains — Ethereum, Solana, Base, BSC, Arbitrum, Hyperliquid, and more. Shows 24h fees in USD and day-over-day change. A live measure of which chains are generating the most economic activity.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "chain-tvl",
    label: "Blockchain TVL Distribution",
    description: "Total value locked across top blockchains — Ethereum, Solana, BSC, Base, Tron, and more. Shows each chain's TVL in USD, percentage share of total DeFi capital, and Ethereum's dominance. A macro view of where DeFi is deployed. Via DeFi Llama.",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "defi-exploits",
    label: "DeFi Exploit Tracker",
    description: "Recent DeFi hacks and exploits from the last 90 days — total funds stolen, most targeted chains, and the largest incidents ranked by size. A live feed of on-chain security incidents via DeFi Llama.",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "global-dex",
    label: "Global DEX Volume Rankings",
    description: "Top 12 decentralized exchanges across all chains by 24h trading volume — Uniswap, Raydium, PancakeSwap, Orca, GMX, and more. Total global DEX volume with 24h change. Via DeFi Llama.",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "futures-basis",
    label: "Crypto Futures Term Structure",
    description: "BTC and ETH futures term structure from Deribit — mark price, basis vs spot, and annualized basis for every active dated expiry. Shows whether the market is in contango or backwardation at a glance.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "dex-aggregators",
    label: "DEX Aggregator Volume Rankings",
    description: "Top 10 DEX aggregators by 24h routed volume — Jupiter, 1inch, CoWSwap, KyberSwap, 0x, and more. Aggregators route trades across multiple DEXes for best execution. Total market volume with 24h change. Via DeFi Llama.",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "meme-coins",
    label: "Meme Coin Leaderboard",
    description: "Top 15 meme coins by market cap — DOGE, SHIB, PEPE, WIF, and more. Price, 24h change, market cap, volume. The heart of crypto retail sentiment in one table. Via CoinGecko.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "cross-chain-gas",
    label: "Cross-Chain Gas Cost Comparison",
    description: "Real-time simple transfer cost across 6 chains: Ethereum L1, Base, Arbitrum, Optimism, BNB Chain, and Solana. Shows gas price in Gwei and USD cost per transfer, ranked cheapest to most expensive. Essential for cost-conscious developers and traders.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "hl-top-pairs",
    label: "Hyperliquid Top Pairs by Volume",
    description: "Top 10 perpetual pairs on Hyperliquid ranked by 24h trading volume — with price, 24h change, open interest, and funding rate for each. See which assets are hottest in perp markets right now. Total Hyperliquid volume included. Via Hyperliquid public API.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "eth-beacon",
    label: "ETH Beacon Chain Stats",
    description: "Live Ethereum proof-of-stake network health: active validator count, total ETH staked, global participation rate, and entry/exit queue depth. Essential metrics for understanding network security and staking demand. Via beaconcha.in public API.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "restaking-tvl",
    label: "Restaking Protocol TVL Rankings",
    description: "Total TVL locked across restaking and liquid restaking protocols: EigenLayer, Symbiotic, Kelp, Puffer, and more. Shows the size of the restaking economy, dominant protocol share, and 1d/7d TVL changes. Via DeFi Llama public API.",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "btc-halving",
    label: "Bitcoin Halving Countdown",
    description: "Live countdown to the next Bitcoin halving: current block height, blocks remaining, estimated date, epoch progress, supply mined %, current and next block reward. Includes complete halving history. Via mempool.space public API.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "sol-validators",
    label: "Solana Validator Rankings",
    description: "Top 10 Solana validators by activated stake — stake amount, % of network, commission rate, and last vote slot. Total validator count, delinquent count, and network stake summary. Via Solana mainnet-beta RPC.",
    price: "1 USDC",
    category: "Solana",
  },
  {
    id: "stable-yields",
    label: "Stablecoin Yield Scanner",
    description: "Top 15 stablecoin yield opportunities across DeFi — USDC, USDT, DAI pools ranked by APY with TVL context. Covers lending protocols, liquidity pools, and yield aggregators. Filters out micro pools and APY outliers. Via DeFi Llama yields API.",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "btc-treasury",
    label: "Public Company Bitcoin Treasury",
    description: "Bitcoin holdings by publicly-traded companies — Strategy (MSTR), MARA Holdings, and 149+ others. Total BTC held, USD value, top 10 holders with share of corporate holdings. Via CoinGecko public treasury API.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "eth-blob",
    label: "Ethereum Blob Fee Market",
    description: "Post-EIP-4844 blobspace snapshot — current blob base fee in gwei, latest block blob utilization (0–6 blobs), fee tier signal, and cost in ETH to submit one 128 KB blob. Essential for L2 rollups managing data-availability costs. Via Ethereum JSON-RPC.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "eth-supply",
    label: "ETH Supply Dynamics",
    description: "Is ETH deflationary right now? Real-time burn rate from EIP-1559 base fees vs validator issuance (~1700 ETH/day), net supply change per hour, annualized supply change %, and the base fee threshold needed to tip ETH into deflation. Sampled from 20 recent blocks. Via Ethereum JSON-RPC.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "dao-governance",
    label: "DAO Governance Snapshot",
    description: "Active and recent governance proposals from major DeFi DAOs — Uniswap, Aave, Arbitrum, Compound, Optimism, ENS, Gnosis, Safe, Curve, and more. Shows proposal title, DAO name, vote count, and status. Via Snapshot GraphQL (hub.snapshot.org).",
    price: "1 USDC",
    category: "DeFi",
  },
  {
    id: "crypto-correlation",
    label: "Crypto Asset Correlations",
    description: "30-day Pearson correlation coefficients of top crypto assets (ETH, SOL, BNB, XRP, DOGE, LINK, AVAX, SUI) vs BTC. Computed from daily log returns. Shows which assets move with Bitcoin and which are decorrelated. Via CoinGecko market chart API.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "chain-dev",
    label: "Blockchain Developer Activity",
    description: "GitHub commit activity for major blockchain core repos — go-ethereum, agave (Solana), Sui, Aptos, Avalanche. Shows 4-week commit counts, 13-week totals, and trend vs prior period. Sourced from GitHub stats/participation API.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "crypto-iv",
    label: "Crypto Implied Volatility",
    description: "BTC and ETH implied volatility from Deribit DVOL — hourly annualized IV with 7-day and 16-day averages. Shows current vol regime (elevated/normal/suppressed) relative to recent history. Forward-looking complement to realized volatility.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "ath-distance",
    label: "Crypto ATH Distance Monitor",
    description: "How far top cryptocurrencies are from their all-time highs — current price vs ATH, % below ATH, date of ATH, and 7-day performance. Coins sorted closest-to-ATH first, giving a quick read on which assets are recovering vs still deeply underwater.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "deriv-overview",
    label: "Crypto Derivatives Market Overview",
    description: "Aggregate perpetual futures open interest, 24h trading volume, and average 8-hour funding rates for BTC, ETH, SOL, BNB, and other major assets — consolidated across all exchanges tracked by CoinGecko. See where leveraged demand is concentrated.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "macro-signals",
    label: "Crypto vs. Traditional Markets",
    description: "Compare 30-day and 7-day returns for Bitcoin, Ethereum, the S&P 500, and Gold. Includes BTC correlation to equities and commodities, plus a risk-on/risk-off signal derived from cross-asset performance. Macro-informed view for crypto traders.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "sol-priority-fees",
    label: "Solana Priority Fee Tracker",
    description: "Real-time Solana network congestion metrics derived from recent block priority fees. Shows median, P75, and P95 fee rates (in micro-lamports per Compute Unit) with estimated USD transaction cost, and a congestion level signal (low / moderate / high / extreme).",
    price: "1 USDC",
    category: "Solana",
  },
  {
    id: "sui-network",
    label: "Sui Network Overview",
    description: "Live Sui blockchain stats: current epoch, active validator count, total transaction history, total staked SUI, DeFi TVL, and SUI token price with 24h change. Data from Sui fullnode RPC, CoinGecko, and DeFi Llama.",
    price: "1 USDC",
    category: "Market Data",
  },
  {
    id: "aptos-network",
    label: "Aptos Network Overview",
    description: "Live Aptos blockchain stats: current epoch, block height, active validator count (114), DeFi TVL, and APT token price with 24h change. Data from Aptos mainnet API, CoinGecko, and DeFi Llama.",
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

const MOCK_STABLECOIN_PEGS: StablecoinPegsData = {
  on_peg_count: 11,
  warning_count: 1,
  depegged_count: 0,
  total_supply_usd: 295_000_000_000,
  stablecoins: [
    { symbol: "USDT",  name: "Tether",     price: 1.0001, dev_pct: +0.01, circ_usd: 184_000_000_000, peg_status: "on-peg",  peg_mechanism: "fiat-backed" },
    { symbol: "USDC",  name: "USD Coin",   price: 0.9999, dev_pct: -0.01, circ_usd:  79_600_000_000, peg_status: "on-peg",  peg_mechanism: "fiat-backed" },
    { symbol: "USDS",  name: "Sky Dollar", price: 0.9998, dev_pct: -0.02, circ_usd:   8_400_000_000, peg_status: "on-peg",  peg_mechanism: "crypto-backed" },
    { symbol: "USDe",  name: "Ethena",     price: 0.9999, dev_pct: -0.01, circ_usd:   5_900_000_000, peg_status: "on-peg",  peg_mechanism: "crypto-backed" },
    { symbol: "DAI",   name: "Dai",        price: 0.9999, dev_pct: -0.01, circ_usd:   4_500_000_000, peg_status: "on-peg",  peg_mechanism: "crypto-backed" },
    { symbol: "USD1",  name: "World Liberty Financial USD", price: 0.9992, dev_pct: -0.08, circ_usd: 4_500_000_000, peg_status: "on-peg", peg_mechanism: "fiat-backed" },
    { symbol: "PYUSD", name: "PayPal USD", price: 1.0002, dev_pct: +0.02, circ_usd:   4_100_000_000, peg_status: "on-peg",  peg_mechanism: "fiat-backed" },
    { symbol: "USDf",  name: "Falcon USD", price: 0.9984, dev_pct: -0.16, circ_usd:   1_600_000_000, peg_status: "warning", peg_mechanism: "crypto-backed" },
    { symbol: "RLUSD", name: "Ripple USD", price: 0.9999, dev_pct: -0.01, circ_usd:   1_500_000_000, peg_status: "on-peg",  peg_mechanism: "fiat-backed" },
    { symbol: "USDD",  name: "USDD",       price: 1.0001, dev_pct: +0.01, circ_usd:   1_100_000_000, peg_status: "on-peg",  peg_mechanism: "crypto-backed" },
    { symbol: "FDUSD", name: "First Digital USD", price: 1.0000, dev_pct: 0.00, circ_usd: 1_400_000_000, peg_status: "on-peg", peg_mechanism: "fiat-backed" },
  ] as StablecoinPegEntry[],
};

const MOCK_MINING_POOLS: MiningPoolsData = {
  total_blocks_3d: 432,
  hashrate_eh: 848.3,
  nakamoto_coefficient: 2,
  top3_concentration_pct: 61.1,
  window: "3 days",
  pools: [
    { name: "Foundry USA",    slug: "foundryusa",  block_count: 155, share_pct: 35.9, rank: 1 },
    { name: "AntPool",        slug: "antpool",     block_count: 109, share_pct: 25.2, rank: 2 },
    { name: "SpiderPool",     slug: "spiderpool",  block_count:  50, share_pct: 11.6, rank: 3 },
    { name: "F2Pool",         slug: "f2pool",      block_count:  37, share_pct:  8.6, rank: 4 },
    { name: "ViaBTC",         slug: "viabtc",      block_count:  32, share_pct:  7.4, rank: 5 },
    { name: "Binance Pool",   slug: "binancepool", block_count:  20, share_pct:  4.6, rank: 6 },
    { name: "MARA Pool",      slug: "marapool",    block_count:  12, share_pct:  2.8, rank: 7 },
    { name: "Luxor",          slug: "luxor",       block_count:   7, share_pct:  1.6, rank: 8 },
    { name: "BTC.com",        slug: "btccom",      block_count:   6, share_pct:  1.4, rank: 9 },
    { name: "Unknown",        slug: "unknown",     block_count:   4, share_pct:  0.9, rank: 10 },
  ] as MiningPoolEntry[],
};

const MOCK_CHAIN_FEES: ChainFeesData = {
  total_24h: 26_284_000,
  top_chain: "Ethereum",
  chains: [
    { chain: "Ethereum",       fees_24h: 8_702_000, change_1d_pct: -12.8 },
    { chain: "Solana",         fees_24h: 8_692_000, change_1d_pct:   3.2 },
    { chain: "Hyperliquid L1", fees_24h: 2_730_000, change_1d_pct: -15.3 },
    { chain: "Base",           fees_24h: 1_678_000, change_1d_pct: -12.5 },
    { chain: "BSC",            fees_24h: 1_396_000, change_1d_pct:   6.8 },
    { chain: "Arbitrum",       fees_24h: 1_356_000, change_1d_pct:  35.7 },
    { chain: "Polygon",        fees_24h:   803_000, change_1d_pct:  41.5 },
    { chain: "Tron",           fees_24h:   192_000, change_1d_pct:  34.8 },
    { chain: "Avalanche",      fees_24h:   294_000, change_1d_pct:  26.2 },
    { chain: "Optimism",       fees_24h:    32_000, change_1d_pct: -26.9 },
  ] as ChainFeeEntry[],
};

const MOCK_CHAIN_TVL: ChainTvlData = {
  total_tvl: 82_400_000_000,
  eth_dominance_pct: 67.2,
  top_chain: "Ethereum",
  chains: [
    { name: "Ethereum", tvl: 55_373_000_000, share_pct: 67.2 },
    { name: "Solana",   tvl:  7_034_000_000, share_pct:  8.5 },
    { name: "BSC",      tvl:  5_800_000_000, share_pct:  7.0 },
    { name: "Tron",     tvl:  4_100_000_000, share_pct:  5.0 },
    { name: "Base",     tvl:  4_070_000_000, share_pct:  4.9 },
    { name: "Arbitrum", tvl:  2_470_000_000, share_pct:  3.0 },
    { name: "Polygon",  tvl:    982_000_000, share_pct:  1.2 },
    { name: "Avalanche",tvl:    690_000_000, share_pct:  0.8 },
    { name: "Optimism", tvl:    560_000_000, share_pct:  0.7 },
    { name: "Sui",      tvl:    501_000_000, share_pct:  0.6 },
    { name: "Near",     tvl:    430_000_000, share_pct:  0.5 },
    { name: "Aptos",    tvl:    390_000_000, share_pct:  0.5 },
  ] as ChainTvlEntry[],
};

const MOCK_DEFI_EXPLOITS: DefiExploitsData = {
  incident_count: 12,
  total_stolen_usd: 143_500_000,
  most_targeted_chain: "Ethereum",
  period_days: 90,
  incidents: [
    { name: "Orbit Bridge",    date: 1704844800, amount: 81_680_000, chain: ["Ethereum"], classification: "Access Control",   technique: "Validator Key Compromise" },
    { name: "Radiant Capital", date: 1706745600, amount: 18_000_000, chain: ["Arbitrum"], classification: "Protocol Logic",   technique: "Flash Loan" },
    { name: "WOOFi",           date: 1709251200, amount:  8_750_000, chain: ["Arbitrum"], classification: "Oracle Exploit",   technique: "Price Manipulation" },
    { name: "Unizen",          date: 1711929600, amount:  2_150_000, chain: ["Ethereum"], classification: "Access Control",   technique: "Approval Exploit" },
    { name: "Prisma Finance",  date: 1710288000, amount: 11_600_000, chain: ["Ethereum"], classification: "Protocol Logic",   technique: "Flash Loan" },
    { name: "Pike Finance",    date: 1714521600, amount:  1_700_000, chain: ["Ethereum"], classification: "Protocol Logic",   technique: "CCTP Integration Bug" },
    { name: "Grand Base",      date: 1713744000, amount:  2_000_000, chain: ["Base"],     classification: "Rug Pull",         technique: "Admin Key Compromise" },
    { name: "Alex Lab",        date: 1715299200, amount: 13_700_000, chain: ["Bitcoin"],  classification: "Access Control",   technique: "Private Key Leak" },
    { name: "Sonne Finance",   date: 1716336000, amount: 20_000_000, chain: ["Optimism"], classification: "Protocol Logic",   technique: "Donation Attack" },
    { name: "DeFi Protocol X", date: 1717804800, amount:  3_920_000, chain: ["BSC"],      classification: "Protocol Logic",   technique: "Reentrancy" },
  ] as DefiExploitEntry[],
};

const MOCK_GLOBAL_DEX: GlobalDexData = {
  total_volume_24h: 8_420_000_000,
  dexes: [
    { name: "Uniswap",      chains: ["Ethereum", "Arbitrum", "Base"],  volume_24h: 1_850_000_000, change_pct:  4.2 },
    { name: "Raydium",      chains: ["Solana"],                         volume_24h: 1_340_000_000, change_pct:  9.7 },
    { name: "PancakeSwap",  chains: ["BSC", "Ethereum", "Arbitrum"],    volume_24h:   720_000_000, change_pct: -3.1 },
    { name: "Orca",         chains: ["Solana"],                         volume_24h:   580_000_000, change_pct:  6.3 },
    { name: "Jupiter",      chains: ["Solana"],                         volume_24h:   510_000_000, change_pct:  8.1 },
    { name: "GMX",          chains: ["Arbitrum", "Avalanche"],          volume_24h:   420_000_000, change_pct:  1.8 },
    { name: "Curve",        chains: ["Ethereum", "Arbitrum", "Base"],   volume_24h:   380_000_000, change_pct: -5.4 },
    { name: "dYdX",         chains: ["Starknet"],                       volume_24h:   290_000_000, change_pct:  2.2 },
    { name: "Aerodrome",    chains: ["Base"],                           volume_24h:   240_000_000, change_pct: 11.5 },
    { name: "Balancer",     chains: ["Ethereum", "Arbitrum"],           volume_24h:   185_000_000, change_pct: -1.9 },
    { name: "Hyperliquid",  chains: ["Hyperliquid"],                    volume_24h:   165_000_000, change_pct:  3.4 },
    { name: "Velodrome",    chains: ["Optimism"],                       volume_24h:   140_000_000, change_pct:  0.6 },
  ] as GlobalDexEntry[],
};

const MOCK_FUTURES_BASIS: FuturesBasisData = {
  btc_spot: 71590,
  eth_spot: 2204,
  btc: [
    { instrument: "BTC-PERPETUAL",  expiry_label: "Perp",   days_to_expiry: 0,   mark_price: 71600,  spot_price: 71590, basis_usd:  10, basis_pct:  0.014, annualized_basis_pct: null },
    { instrument: "BTC-20MAR26",    expiry_label: "Mar 20", days_to_expiry: 2,   mark_price: 71603,  spot_price: 71590, basis_usd:  13, basis_pct:  0.018, annualized_basis_pct: null },
    { instrument: "BTC-27MAR26",    expiry_label: "Mar 27", days_to_expiry: 9,   mark_price: 71633,  spot_price: 71590, basis_usd:  43, basis_pct:  0.060, annualized_basis_pct: 2.44 },
    { instrument: "BTC-24APR26",    expiry_label: "Apr 24", days_to_expiry: 37,  mark_price: 71729,  spot_price: 71590, basis_usd: 139, basis_pct:  0.194, annualized_basis_pct: 1.91 },
    { instrument: "BTC-26JUN26",    expiry_label: "Jun 26", days_to_expiry: 100, mark_price: 72039,  spot_price: 71590, basis_usd: 449, basis_pct:  0.627, annualized_basis_pct: 2.29 },
    { instrument: "BTC-25SEP26",    expiry_label: "Sep 25", days_to_expiry: 191, mark_price: 72637,  spot_price: 71590, basis_usd: 1047, basis_pct: 1.462, annualized_basis_pct: 2.79 },
    { instrument: "BTC-25DEC26",    expiry_label: "Dec 25", days_to_expiry: 282, mark_price: 73413,  spot_price: 71590, basis_usd: 1823, basis_pct: 2.546, annualized_basis_pct: 3.30 },
  ] as FuturesBasisEntry[],
  eth: [
    { instrument: "ETH-PERPETUAL",  expiry_label: "Perp",   days_to_expiry: 0,   mark_price: 2204.7,  spot_price: 2204, basis_usd:   0.7,  basis_pct:  0.032, annualized_basis_pct: null },
    { instrument: "ETH-20MAR26",    expiry_label: "Mar 20", days_to_expiry: 2,   mark_price: 2204.6,  spot_price: 2204, basis_usd:   0.6,  basis_pct:  0.027, annualized_basis_pct: null },
    { instrument: "ETH-27MAR26",    expiry_label: "Mar 27", days_to_expiry: 9,   mark_price: 2207.7,  spot_price: 2204, basis_usd:   3.7,  basis_pct:  0.168, annualized_basis_pct: 6.82 },
    { instrument: "ETH-24APR26",    expiry_label: "Apr 24", days_to_expiry: 37,  mark_price: 2210.6,  spot_price: 2204, basis_usd:   6.6,  basis_pct:  0.299, annualized_basis_pct: 2.95 },
    { instrument: "ETH-26JUN26",    expiry_label: "Jun 26", days_to_expiry: 100, mark_price: 2222.1,  spot_price: 2204, basis_usd:  18.1,  basis_pct:  0.821, annualized_basis_pct: 3.00 },
    { instrument: "ETH-25SEP26",    expiry_label: "Sep 25", days_to_expiry: 191, mark_price: 2241.7,  spot_price: 2204, basis_usd:  37.7,  basis_pct:  1.711, annualized_basis_pct: 3.27 },
    { instrument: "ETH-25DEC26",    expiry_label: "Dec 25", days_to_expiry: 282, mark_price: 2263.9,  spot_price: 2204, basis_usd:  59.9,  basis_pct:  2.718, annualized_basis_pct: 3.52 },
  ] as FuturesBasisEntry[],
};

const MOCK_DEX_AGGREGATORS: DexAggregatorsData = {
  total_volume_24h: 1_973_000_000,
  total_volume_7d: 12_789_000_000,
  aggregators: [
    { name: "Jupiter Aggregator",  chains: ["Solana"],                           volume_24h: 474_648_460, volume_7d: 2_734_266_242, change_pct: -9.09 },
    { name: "KyberSwap Aggregator",chains: ["Ethereum", "Arbitrum", "Avalanche"], volume_24h: 273_908_259, volume_7d: 1_451_900_838, change_pct: 14.98 },
    { name: "OKX Swap",            chains: ["Ethereum", "Sonic", "ZKsync Era"],  volume_24h: 210_639_671, volume_7d: 1_526_423_517, change_pct: 4.77  },
    { name: "CoWSwap",             chains: ["Ethereum", "Gnosis", "Arbitrum"],   volume_24h: 122_707_923, volume_7d:   826_765_429, change_pct: -40.45 },
    { name: "1inch",               chains: ["Ethereum", "Arbitrum", "Polygon"],  volume_24h: 114_848_800, volume_7d:   925_488_127, change_pct: -45.53 },
    { name: "OpenOcean",           chains: ["Ethereum", "BSC", "Polygon"],       volume_24h: 109_152_758, volume_7d:   447_752_312, change_pct: null   },
    { name: "0x Aggregator",       chains: ["Arbitrum", "Avalanche", "Base"],    volume_24h:  88_253_603, volume_7d:   646_210_706, change_pct: -23.77 },
    { name: "Velora",              chains: ["Ethereum", "OP Mainnet", "BSC"],    volume_24h:  71_474_327, volume_7d:   366_345_071, change_pct: 13.46  },
    { name: "Binance Wallet",      chains: ["Ethereum", "Arbitrum", "Polygon"],  volume_24h:  62_678_065, volume_7d:   380_650_118, change_pct: 20.40  },
    { name: "Bebop",               chains: ["Arbitrum", "Ethereum", "Polygon"],  volume_24h:  61_348_026, volume_7d:   448_166_814, change_pct: -55.79 },
  ] as DexAggregatorEntry[],
};

const MOCK_MEME_COINS: MemeCoinsData = {
  total_market_cap_usd: 68_400_000_000,
  top_gainer: "PEPE",
  top_loser: "BONK",
  coins: [
    { name: "Dogecoin",           symbol: "DOGE",  price_usd: 0.0952,     change_24h_pct: -6.03,  market_cap_usd: 14_618_024_115, volume_24h_usd: 1_507_166_707 },
    { name: "Shiba Inu",          symbol: "SHIB",  price_usd: 0.0000058,  change_24h_pct: -5.29,  market_cap_usd:  8_614_322_100, volume_24h_usd:   523_081_400 },
    { name: "Pepe",               symbol: "PEPE",  price_usd: 0.00000352, change_24h_pct: 3.41,   market_cap_usd:  4_812_011_200, volume_24h_usd:   891_234_567 },
    { name: "dogwifhat",          symbol: "WIF",   price_usd: 0.871,      change_24h_pct: -4.12,  market_cap_usd:   871_000_000,  volume_24h_usd:   103_400_000 },
    { name: "Floki",              symbol: "FLOKI", price_usd: 0.0000832,  change_24h_pct: -3.87,  market_cap_usd:   792_345_678,  volume_24h_usd:    89_120_000 },
    { name: "Bonk",               symbol: "BONK",  price_usd: 0.0000119,  change_24h_pct: -8.21,  market_cap_usd:   703_450_000,  volume_24h_usd:   122_830_000 },
    { name: "Popcat",             symbol: "POPCAT",price_usd: 0.295,      change_24h_pct: -5.60,  market_cap_usd:   295_000_000,  volume_24h_usd:    67_340_000 },
    { name: "Cat in a dogs world",symbol: "MEW",   price_usd: 0.00384,    change_24h_pct: -4.92,  market_cap_usd:   252_100_000,  volume_24h_usd:    38_710_000 },
    { name: "Mog Coin",           symbol: "MOG",   price_usd: 0.00000133, change_24h_pct: 1.24,   market_cap_usd:   213_780_000,  volume_24h_usd:    24_560_000 },
    { name: "Turbo",              symbol: "TURBO", price_usd: 0.00437,    change_24h_pct: -2.80,  market_cap_usd:   186_290_000,  volume_24h_usd:    31_120_000 },
  ] as MemeCoinEntry[],
};

const MOCK_CROSS_CHAIN_GAS: CrossChainGasData = {
  cheapest: "Solana",
  eth_base_fee_gwei: 8.4,
  chains: [
    { chain: "Solana",       symbol: "SOL", gas_price_gwei: null, transfer_cost_usd: 0.000750, relative_pct:  0 },
    { chain: "Base",         symbol: "ETH", gas_price_gwei: 0.003, transfer_cost_usd: 0.0013,  relative_pct:  1 },
    { chain: "Arbitrum",     symbol: "ETH", gas_price_gwei: 0.012, transfer_cost_usd: 0.0053,  relative_pct:  3 },
    { chain: "Optimism",     symbol: "ETH", gas_price_gwei: 0.032, transfer_cost_usd: 0.014,   relative_pct:  8 },
    { chain: "BNB Chain",    symbol: "BNB", gas_price_gwei: 1.1,   transfer_cost_usd: 0.063,   relative_pct: 38 },
    { chain: "Ethereum L1",  symbol: "ETH", gas_price_gwei: 8.4,   transfer_cost_usd: 0.168,   relative_pct: 100 },
  ] as CrossChainGasEntry[],
};

const MOCK_HL_TOP_PAIRS: HlTopPairsData = {
  top_pair: "BTC",
  total_volume_24h_usd: 6_400_000_000,
  pairs: [
    { symbol: "BTC",      volume_24h_usd: 2_938_000_000, mark_price: 71019,  price_change_pct: -3.62, open_interest_usd: 1_975_000_000, funding_rate: -0.0000089 },
    { symbol: "ETH",      volume_24h_usd: 1_722_000_000, mark_price: 2191,   price_change_pct: -5.11, open_interest_usd: 1_275_000_000, funding_rate: -0.0000078 },
    { symbol: "HYPE",     volume_24h_usd:   615_000_000, mark_price: 42.19,  price_change_pct:  2.34, open_interest_usd:   854_000_000, funding_rate:  0.0000130 },
    { symbol: "SOL",      volume_24h_usd:   280_000_000, mark_price: 90.05,  price_change_pct: -4.88, open_interest_usd:   312_000_000, funding_rate: -0.0000072 },
    { symbol: "ZEC",      volume_24h_usd:    93_900_000, mark_price: 248.87, price_change_pct: 14.20, open_interest_usd:    67_500_000, funding_rate:  0.0000130 },
    { symbol: "FARTCOIN", volume_24h_usd:    64_900_000, mark_price: 0.2133, price_change_pct: -6.22, open_interest_usd:    48_800_000, funding_rate:  0.0000130 },
    { symbol: "XRP",      volume_24h_usd:    56_100_000, mark_price: 1.4596, price_change_pct: -3.41, open_interest_usd:    85_100_000, funding_rate: -0.0000210 },
    { symbol: "TAO",      volume_24h_usd:    30_000_000, mark_price: 272.32, price_change_pct: -7.55, open_interest_usd:    43_100_000, funding_rate:  0.0000130 },
    { symbol: "ASTER",    volume_24h_usd:    26_000_000, mark_price: 0.6923, price_change_pct: -1.83, open_interest_usd:    69_200_000, funding_rate: -0.0000180 },
    { symbol: "SUI",      volume_24h_usd:    19_300_000, mark_price: 0.9837, price_change_pct: -8.07, open_interest_usd:    27_900_000, funding_rate:  0.0000000 },
  ] as HlPairEntry[],
};

const MOCK_ETH_BEACON: EthBeaconData = {
  epoch: 435_051,
  slot: 13_921_640,
  slot_in_epoch: 8,
  finalized_epoch: 435_049,
  finality_lag: 2,
  is_finalizing: true,
  block_number: 24_688_254,
  base_fee_gwei: 0.0995,
  gas_util_pct: 47.2,
};

const MOCK_RESTAKING_TVL: RestakingData = {
  protocols: [
    { name: "EigenLayer", tvl: 11_200_000_000, change_1d_pct: 0.4, change_7d_pct: -2.1, chains: ["Ethereum"], category: "Restaking" },
    { name: "Symbiotic", tvl: 2_800_000_000, change_1d_pct: 1.2, change_7d_pct: 4.5, chains: ["Ethereum"], category: "Restaking" },
    { name: "Kelp DAO", tvl: 1_650_000_000, change_1d_pct: -0.3, change_7d_pct: 1.8, chains: ["Ethereum", "Arbitrum"], category: "Liquid Restaking" },
    { name: "Puffer Finance", tvl: 980_000_000, change_1d_pct: 0.7, change_7d_pct: -0.9, chains: ["Ethereum"], category: "Liquid Restaking" },
    { name: "ether.fi", tvl: 820_000_000, change_1d_pct: 0.2, change_7d_pct: 3.1, chains: ["Ethereum"], category: "Liquid Restaking" },
  ],
  total_tvl: 17_450_000_000,
  top_protocol: "EigenLayer",
  dominant_pct: 64.2,
};

const MOCK_BTC_HALVING: BtcHalvingData = {
  current_height: 941_313,
  next_halving_height: 1_050_000,
  blocks_remaining: 108_687,
  epoch_progress_pct: 48.2,
  current_reward_btc: 3.125,
  next_reward_btc: 1.5625,
  estimated_days: 755,
  estimated_date: "March 2028",
  avg_block_time_secs: 600,
  supply_mined_pct: 94.3,
  halvings: [
    { number: 1, block_height: 210_000, date_approx: "Nov 2012", reward_before_btc: 50, reward_after_btc: 25 },
    { number: 2, block_height: 420_000, date_approx: "Jul 2016", reward_before_btc: 25, reward_after_btc: 12.5 },
    { number: 3, block_height: 630_000, date_approx: "May 2020", reward_before_btc: 12.5, reward_after_btc: 6.25 },
    { number: 4, block_height: 840_000, date_approx: "Apr 2024", reward_before_btc: 6.25, reward_after_btc: 3.125 },
  ],
};

const MOCK_SOL_VALIDATORS: SolValidatorsData = {
  validators: [
    { rank: 1, vote_pubkey: "7Np41oeYqPefeNQEHSv1UDhYrehxin3NStELsSKCT4K2", node_pubkey_short: "7Np4…4K2", activated_stake_sol: 20_841, stake_pct: 5.21, commission: 0, last_vote: 318_456_789, status: "active" },
    { rank: 2, vote_pubkey: "dv1ZAGvdsz5hHLwWXsVnM94hWf1pjbKVau1QVkaMJ92", node_pubkey_short: "dv1Z…J92", activated_stake_sol: 14_203, stake_pct: 3.55, commission: 8, last_vote: 318_456_788, status: "active" },
    { rank: 3, vote_pubkey: "GE6atKoWiQ2pt3zL7N13pjNHjdLVys8LinG8qeJLcAiN", node_pubkey_short: "GE6a…AiN", activated_stake_sol: 11_567, stake_pct: 2.89, commission: 5, last_vote: 318_456_787, status: "active" },
    { rank: 4, vote_pubkey: "CakcnaRDHka2gXyfxNhaszeW5ApOf9E15gBQ1s5p4vu", node_pubkey_short: "Cakc…4vu", activated_stake_sol: 9_834, stake_pct: 2.46, commission: 0, last_vote: 318_456_786, status: "active" },
    { rank: 5, vote_pubkey: "HbZ5FdqjoBNLyfmtBNjmMqXxFq6dFbDLhqEMbmJVo8a3", node_pubkey_short: "HbZ5…8a3", activated_stake_sol: 8_912, stake_pct: 2.23, commission: 10, last_vote: 318_456_785, status: "active" },
    { rank: 6, vote_pubkey: "B1mrQSpdeMU9gCvkJ6VsXVVoYjRGkNA7TtjMyqxrhecH", node_pubkey_short: "B1mr…ecH", activated_stake_sol: 7_456, stake_pct: 1.86, commission: 7, last_vote: 318_456_784, status: "active" },
    { rank: 7, vote_pubkey: "4vJ9JU1bJJE96FWSJKvHsmmFADCg4gpZQff4P3bkLKi", node_pubkey_short: "4vJ9…KLi", activated_stake_sol: 6_789, stake_pct: 1.70, commission: 0, last_vote: 318_456_783, status: "active" },
    { rank: 8, vote_pubkey: "rFqFJ9g7TGBD8Ed7TPDnvGKZ5pWLPDyxLcvcH2eRCtt", node_pubkey_short: "rFqF…Ctt", activated_stake_sol: 5_934, stake_pct: 1.48, commission: 5, last_vote: 318_456_782, status: "active" },
    { rank: 9, vote_pubkey: "5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1", node_pubkey_short: "5Q54…4j1", activated_stake_sol: 5_123, stake_pct: 1.28, commission: 0, last_vote: 318_456_781, status: "active" },
    { rank: 10, vote_pubkey: "EWoJBfBqpDUdUaJAMQnCBCRCRCRFpDuMH2uQFRqpqUbn", node_pubkey_short: "EWoJ…Ubn", activated_stake_sol: 4_567, stake_pct: 1.14, commission: 8, last_vote: 318_456_780, status: "active" },
  ],
  total_stake_sol: 399.8,
  total_validators: 1_506,
  delinquent_count: 14,
  avg_commission: 4.3,
  slot_height: 318_456_789,
};

const MOCK_STABLE_YIELDS: StableYieldsData = {
  pools: [
    { protocol: "Morpho", chain: "Ethereum", symbol: "USDC", apy_pct: 9.81, tvl_usd: 1_240_000_000 },
    { protocol: "Fluid", chain: "Ethereum", symbol: "USDC", apy_pct: 8.34, tvl_usd: 620_000_000 },
    { protocol: "Compound V3", chain: "Arbitrum", symbol: "USDC", apy_pct: 7.12, tvl_usd: 480_000_000 },
    { protocol: "Aave V3", chain: "Polygon", symbol: "USDC", apy_pct: 6.88, tvl_usd: 890_000_000 },
    { protocol: "Spark", chain: "Ethereum", symbol: "DAI", apy_pct: 6.50, tvl_usd: 1_850_000_000 },
    { protocol: "Maple Finance", chain: "Ethereum", symbol: "USDC", apy_pct: 6.22, tvl_usd: 210_000_000 },
    { protocol: "Aave V3", chain: "Base", symbol: "USDC", apy_pct: 5.95, tvl_usd: 340_000_000 },
    { protocol: "Compound V3", chain: "Ethereum", symbol: "USDT", apy_pct: 5.60, tvl_usd: 520_000_000 },
    { protocol: "Euler", chain: "Ethereum", symbol: "USDC", apy_pct: 5.41, tvl_usd: 190_000_000 },
    { protocol: "Aave V3", chain: "Arbitrum", symbol: "USDT", apy_pct: 5.10, tvl_usd: 430_000_000 },
    { protocol: "Morpho", chain: "Base", symbol: "USDC", apy_pct: 4.88, tvl_usd: 280_000_000 },
    { protocol: "Aave V3", chain: "Ethereum", symbol: "USDC", apy_pct: 4.72, tvl_usd: 3_200_000_000 },
    { protocol: "Curve", chain: "Ethereum", symbol: "USDC", apy_pct: 4.35, tvl_usd: 670_000_000 },
    { protocol: "Compound V3", chain: "Base", symbol: "USDC", apy_pct: 4.10, tvl_usd: 160_000_000 },
    { protocol: "Aave V3", chain: "Optimism", symbol: "USDC", apy_pct: 3.87, tvl_usd: 210_000_000 },
  ],
  avg_stablecoin_apy: 5.92,
  highest_protocol: "Morpho",
  highest_apy: 9.81,
  total_shown_tvl: 11_290_000_000,
};

const MOCK_BTC_TREASURY: BtcTreasuryData = {
  total_holdings: 1_184_917,
  total_value_usd: 83_448_321_809,
  market_cap_dominance: 6.009,
  company_count: 151,
  top_companies: [
    { name: "Strategy", symbol: "MSTR.US", country: "US", total_btc: 761_068, value_usd: 53_586_406_000, pct_of_supply: 3.624 },
    { name: "MARA Holdings", symbol: "MARA.US", country: "US", total_btc: 53_822, value_usd: 3_789_000_000, pct_of_supply: 0.256 },
    { name: "XXI", symbol: "XXI.US", country: "US", total_btc: 43_514, value_usd: 3_063_000_000, pct_of_supply: 0.207 },
    { name: "Riot Platforms", symbol: "RIOT.US", country: "US", total_btc: 19_223, value_usd: 1_353_000_000, pct_of_supply: 0.092 },
    { name: "Metaplanet", symbol: "3350.T", country: "JP", total_btc: 4_206, value_usd: 296_000_000, pct_of_supply: 0.020 },
    { name: "CleanSpark", symbol: "CLSK.US", country: "US", total_btc: 11_177, value_usd: 787_000_000, pct_of_supply: 0.053 },
    { name: "Cipher Mining", symbol: "CIFR.US", country: "US", total_btc: 2_311, value_usd: 162_700_000, pct_of_supply: 0.011 },
    { name: "Hive Digital", symbol: "HIVE.US", country: "CA", total_btc: 2_201, value_usd: 154_900_000, pct_of_supply: 0.010 },
    { name: "Core Scientific", symbol: "CORZ.US", country: "US", total_btc: 1_474, value_usd: 103_700_000, pct_of_supply: 0.007 },
    { name: "Coinbase", symbol: "COIN.US", country: "US", total_btc: 9_480, value_usd: 667_600_000, pct_of_supply: 0.045 },
  ],
  top_holder: "Strategy",
  top_holder_btc: 761_068,
  top_holder_pct: 64.2,
};

const MOCK_ETH_BLOB: EthBlobData = {
  blob_base_fee_gwei: 0.0036,
  blobs_in_latest: 2,
  max_blobs_per_block: 6,
  target_blobs_per_block: 3,
  utilization_pct: 33.3,
  block_number: 22_000_000,
  fee_tier: "Cheap",
  blob_cost_eth: 0.000472,
};

const MOCK_ETH_SUPPLY: EthSupplyData = {
  burn_per_hour: 0.59,
  issuance_per_hour: 70.83,
  net_per_hour: -70.24,
  is_deflationary: false,
  base_fee_gwei: 0.07,
  deflation_threshold_gwei: 15.74,
  blocks_sampled: 20,
  supply_change_pct_annual: -0.513,
};

const MOCK_DAO_GOVERNANCE: DaoGovernanceData = {
  proposals: [
    { id: "0x01", title: "[RFC] Fee Switch Activation for USDC/ETH Pool", dao_name: "Uniswap", dao_id: "uniswapgovernance.eth", state: "active", votes: 287, end_timestamp: Math.floor(Date.now() / 1000) + 86400 * 3 },
    { id: "0x02", title: "Activate Safety Module Cooldown Period Update", dao_name: "Aave", dao_id: "aave.eth", state: "active", votes: 512, end_timestamp: Math.floor(Date.now() / 1000) + 86400 * 5 },
    { id: "0x03", title: "ARB Incentives Program — Q2 2026 Renewal", dao_name: "Arbitrum DAO", dao_id: "arbitrumfoundation.eth", state: "closed", votes: 1843, end_timestamp: Math.floor(Date.now() / 1000) - 86400 },
    { id: "0x04", title: "ENS DAO Working Group Funding Q2 2026", dao_name: "ENS", dao_id: "ens.eth", state: "closed", votes: 934, end_timestamp: Math.floor(Date.now() / 1000) - 86400 * 2 },
  ],
  active_count: 2,
  closed_count: 2,
};

const MOCK_CRYPTO_CORRELATION: CryptoCorrelationData = {
  assets: [
    { symbol: "ETH", correlation_30d: 0.921, strength: "high" },
    { symbol: "SOL", correlation_30d: 0.874, strength: "high" },
    { symbol: "AVAX", correlation_30d: 0.832, strength: "high" },
    { symbol: "BNB", correlation_30d: 0.789, strength: "high" },
    { symbol: "LINK", correlation_30d: 0.751, strength: "high" },
    { symbol: "DOGE", correlation_30d: 0.612, strength: "moderate" },
    { symbol: "XRP", correlation_30d: 0.543, strength: "moderate" },
    { symbol: "SUI", correlation_30d: 0.487, strength: "low" },
  ],
  btc_price_usd: 84200,
  period_days: 30,
};

const MOCK_CHAIN_DEV: ChainDevData = {
  chains: [
    { chain: "Solana",    repo: "anza-xyz/agave",          commits_4w: 142, commits_13w: 438, trend_pct: 12.7,  activity_level: "high" },
    { chain: "Sui",       repo: "MystenLabs/sui",           commits_4w: 118, commits_13w: 362, trend_pct: 5.4,   activity_level: "high" },
    { chain: "Aptos",     repo: "aptos-labs/aptos-core",    commits_4w:  96, commits_13w: 291, trend_pct: -3.1,  activity_level: "high" },
    { chain: "Ethereum",  repo: "ethereum/go-ethereum",     commits_4w:  72, commits_13w: 219, trend_pct: 8.2,   activity_level: "moderate" },
    { chain: "Avalanche", repo: "ava-labs/avalanchego",     commits_4w:  41, commits_13w: 128, trend_pct: -9.5,  activity_level: "moderate" },
  ],
  fetched_at: new Date().toISOString(),
  period_note: "Last 4 weeks vs prior 4 weeks",
};

const MOCK_IMPLIED_VOL: ImpliedVolData = {
  assets: [
    { symbol: "BTC", iv_current: 46.2, iv_7d_avg: 48.5, iv_16d_avg: 52.3, regime: "suppressed" },
    { symbol: "ETH", iv_current: 60.1, iv_7d_avg: 63.2, iv_16d_avg: 68.4, regime: "suppressed" },
  ],
  note: "Via Deribit DVOL · hourly snapshots, annualized %",
};

const MOCK_ATH_DISTANCE: AthDistanceData = {
  coins: [
    { symbol: "BTC",  name: "Bitcoin",       current_price: 70455,  ath: 126080, ath_change_pct: -44.1, ath_date: "2025-10-06", change_7d_pct:  1.2, market_cap_rank: 1 },
    { symbol: "ETH",  name: "Ethereum",      current_price:  2080,  ath:   4946, ath_change_pct: -57.9, ath_date: "2025-08-24", change_7d_pct: -1.8, market_cap_rank: 2 },
    { symbol: "BNB",  name: "BNB",           current_price:   640,  ath:   1370, ath_change_pct: -53.3, ath_date: "2025-10-13", change_7d_pct:  0.5, market_cap_rank: 3 },
    { symbol: "XRP",  name: "XRP",           current_price:  1.58,  ath:      4, ath_change_pct: -60.5, ath_date: "2025-07-18", change_7d_pct: -2.4, market_cap_rank: 4 },
    { symbol: "SOL",  name: "Solana",        current_price:    87,  ath:    293, ath_change_pct: -70.3, ath_date: "2025-01-19", change_7d_pct: -3.1, market_cap_rank: 5 },
    { symbol: "LINK", name: "Chainlink",     current_price:    12,  ath:     53, ath_change_pct: -77.4, ath_date: "2024-12-10", change_7d_pct: -1.5, market_cap_rank: 14 },
    { symbol: "NEAR", name: "NEAR Protocol", current_price:  2.45,  ath:   20.4, ath_change_pct: -88.0, ath_date: "2022-01-16", change_7d_pct: -4.2, market_cap_rank: 20 },
    { symbol: "ADA",  name: "Cardano",       current_price:  0.27,  ath:   3.10, ath_change_pct: -91.3, ath_date: "2021-09-02", change_7d_pct: -2.8, market_cap_rank: 10 },
    { symbol: "AVAX", name: "Avalanche",     current_price:  8.50,  ath:    145, ath_change_pct: -94.1, ath_date: "2021-11-21", change_7d_pct: -3.5, market_cap_rank: 22 },
    { symbol: "DOT",  name: "Polkadot",      current_price:  3.80,  ath:   55.0, ath_change_pct: -93.1, ath_date: "2021-11-04", change_7d_pct: -2.0, market_cap_rank: 18 },
  ],
  note: "Via CoinGecko · sorted closest to ATH first · prices updated hourly",
};

const MOCK_DERIV_OVERVIEW: DerivOverviewData = {
  assets: [
    { index: "BTC",  total_oi_usd: 28_400_000_000, avg_funding_8h_pct:  0.0105, total_volume_24h: 72_500_000_000, market_count: 38 },
    { index: "ETH",  total_oi_usd: 11_200_000_000, avg_funding_8h_pct:  0.0082, total_volume_24h: 28_100_000_000, market_count: 35 },
    { index: "SOL",  total_oi_usd:  3_100_000_000, avg_funding_8h_pct: -0.0023, total_volume_24h:  8_400_000_000, market_count: 24 },
    { index: "BNB",  total_oi_usd:  1_350_000_000, avg_funding_8h_pct:  0.0044, total_volume_24h:  3_200_000_000, market_count: 18 },
    { index: "XRP",  total_oi_usd:  1_020_000_000, avg_funding_8h_pct:  0.0018, total_volume_24h:  2_800_000_000, market_count: 20 },
    { index: "DOGE", total_oi_usd:    680_000_000, avg_funding_8h_pct:  0.0031, total_volume_24h:  1_900_000_000, market_count: 16 },
    { index: "AVAX", total_oi_usd:    290_000_000, avg_funding_8h_pct: -0.0041, total_volume_24h:    720_000_000, market_count: 12 },
    { index: "LINK", total_oi_usd:    210_000_000, avg_funding_8h_pct:  0.0009, total_volume_24h:    540_000_000, market_count: 14 },
  ],
  note: "Via CoinGecko · perpetual contracts only · OI and volume in USD · funding rate is 8-hour average across all exchanges",
};

const MOCK_MACRO_SIGNALS: MacroSignalsData = {
  assets: [
    { symbol: "BTC",  name: "Bitcoin",        return_30d_pct: -18.4, return_7d_pct: -6.2,  current_price: 70452,   asset_class: "crypto" },
    { symbol: "ETH",  name: "Ethereum",       return_30d_pct: -24.1, return_7d_pct: -8.5,  current_price: 2137,    asset_class: "crypto" },
    { symbol: "SPX",  name: "S&P 500",        return_30d_pct:  -6.2, return_7d_pct: -2.1,  current_price: 6606,    asset_class: "equities" },
    { symbol: "GOLD", name: "Gold (XAU/USD)", return_30d_pct:   8.3, return_7d_pct:  3.4,  current_price: 4682,    asset_class: "commodities" },
  ],
  btc_spx_correlation_30d: 0.72,
  btc_gold_correlation_30d: -0.18,
  risk_signal: "risk-off",
  note: "Crypto via CoinGecko · Equities & Commodities via Stooq · 30 trading days analyzed",
};

const MOCK_SOL_PRIORITY_FEES: SolPriorityFeeData = {
  p50_micro_lamports: 1000,
  p75_micro_lamports: 5000,
  p95_micro_lamports: 50000,
  p50_usd: 0.000026,
  p95_usd: 0.0013,
  congestion: "moderate",
  sol_price_usd: 130,
  slots_sampled: 150,
};

const MOCK_SUI_NETWORK: SuiNetworkData = {
  epoch: 1072,
  active_validators: 128,
  total_transactions: 4_957_000_000,
  total_staked_sui: 7_450_000_000,
  sui_price_usd: 0.97,
  sui_change_24h: 0.93,
  defi_tvl_usd: 611_000_000,
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
  } else if (serviceType === "stablecoin-pegs") {
    const sp = liveData?.stablecoin_pegs ?? MOCK_STABLECOIN_PEGS;
    mockService = liveData ?? {
      service_type: "stablecoin-pegs",
      result: `${sp.on_peg_count} on-peg · ${sp.warning_count} warnings · ${sp.depegged_count} depegged · ${sp.stablecoins[0]?.symbol} ${(sp.stablecoins[0]?.dev_pct ?? 0) >= 0 ? "+" : ""}${sp.stablecoins[0]?.dev_pct}%`,
      stablecoin_pegs: sp,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "mining-pools") {
    const mp = liveData?.mining_pools ?? MOCK_MINING_POOLS;
    mockService = liveData ?? {
      service_type: "mining-pools",
      result: `${mp.pools[0]?.name} ${mp.pools[0]?.share_pct}% · Nakamoto: ${mp.nakamoto_coefficient} · ${mp.hashrate_eh} EH/s`,
      mining_pools: mp,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "chain-fees") {
    const cf = liveData?.chain_fees ?? MOCK_CHAIN_FEES;
    const fmtUsd = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v}`;
    mockService = liveData ?? {
      service_type: "chain-fees",
      result: `${cf.top_chain} leads · ${cf.chains[0]?.chain} ${fmtUsd(cf.chains[0]?.fees_24h ?? 0)}${cf.chains[0]?.change_1d_pct != null ? ` (${cf.chains[0].change_1d_pct >= 0 ? "+" : ""}${cf.chains[0].change_1d_pct.toFixed(1)}%)` : ""}`,
      chain_fees: cf,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "chain-tvl") {
    const ct = liveData?.chain_tvl ?? MOCK_CHAIN_TVL;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v}`;
    mockService = liveData ?? {
      service_type: "chain-tvl",
      result: `Total DeFi TVL: ${fmtUsd(ct.total_tvl)} · ETH dominance ${ct.eth_dominance_pct.toFixed(1)}% · Top: ${ct.chains[0]?.name} ${fmtUsd(ct.chains[0]?.tvl ?? 0)} (${ct.chains[0]?.share_pct.toFixed(1)}%)`,
      chain_tvl: ct,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "defi-exploits") {
    const de = liveData?.defi_exploits ?? MOCK_DEFI_EXPLOITS;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${(v / 1e3).toFixed(0)}K`;
    mockService = liveData ?? {
      service_type: "defi-exploits",
      result: `${de.incident_count} exploits in ${de.period_days}d · ${fmtUsd(de.total_stolen_usd)} stolen · Most targeted: ${de.most_targeted_chain} · Largest: ${de.incidents[0]?.name} (${fmtUsd(de.incidents[0]?.amount ?? 0)})`,
      defi_exploits: de,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "global-dex") {
    const gd = liveData?.global_dex ?? MOCK_GLOBAL_DEX;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;
    mockService = liveData ?? {
      service_type: "global-dex",
      result: `Total DEX Vol (24h): ${fmtUsd(gd.total_volume_24h)} · Top: ${gd.dexes[0]?.name} ${fmtUsd(gd.dexes[0]?.volume_24h ?? 0)} · ${gd.dexes.length} DEXes ranked`,
      global_dex: gd,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "futures-basis") {
    const fb = liveData?.futures_basis ?? MOCK_FUTURES_BASIS;
    const nearest = fb.btc.find((e) => e.days_to_expiry > 0);
    mockService = liveData ?? {
      service_type: "futures-basis",
      result: nearest
        ? `BTC Spot $${fb.btc_spot.toLocaleString(undefined, { maximumFractionDigits: 0 })} · Nearest basis ${nearest.basis_pct >= 0 ? "+" : ""}${nearest.basis_pct.toFixed(3)}% (${nearest.expiry_label}) · ${fb.btc.length + fb.eth.length} contracts`
        : "BTC/ETH futures term structure — Deribit",
      futures_basis: fb,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "dex-aggregators") {
    const da = liveData?.dex_aggregators ?? MOCK_DEX_AGGREGATORS;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;
    const top = da.aggregators[0];
    mockService = liveData ?? {
      service_type: "dex-aggregators",
      result: `Total agg vol (24h): ${fmtUsd(da.total_volume_24h)} · Top: ${top?.name} ${fmtUsd(top?.volume_24h ?? 0)} · ${da.aggregators.length} aggregators`,
      dex_aggregators: da,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "meme-coins") {
    const mc = liveData?.meme_coins ?? MOCK_MEME_COINS;
    const fmtMcap = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    mockService = liveData ?? {
      service_type: "meme-coins",
      result: `${mc.coins.length} meme coins · Total mcap ${fmtMcap(mc.total_market_cap_usd)} · Top gainer: ${mc.top_gainer} · Biggest drop: ${mc.top_loser}`,
      meme_coins: mc,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "cross-chain-gas") {
    const ccg = liveData?.cross_chain_gas ?? MOCK_CROSS_CHAIN_GAS;
    const cheapEntry = ccg.chains[0];
    const top3 = ccg.chains.slice(0, 3)
      .map((c) => `${c.chain}: $${c.transfer_cost_usd < 0.01 ? c.transfer_cost_usd.toFixed(6) : c.transfer_cost_usd.toFixed(4)}`)
      .join(" · ");
    mockService = liveData ?? {
      service_type: "cross-chain-gas",
      result: `Cheapest: ${ccg.cheapest} · ETH L1: ${ccg.eth_base_fee_gwei} Gwei · ${top3}`,
      cross_chain_gas: ccg,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "hl-top-pairs") {
    const ht = liveData?.hl_top_pairs ?? MOCK_HL_TOP_PAIRS;
    const fmtVol = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`;
    mockService = liveData ?? {
      service_type: "hl-top-pairs",
      result: `#1: ${ht.top_pair} ${fmtVol(ht.pairs[0]?.volume_24h_usd ?? 0)} · Total HL vol ${fmtVol(ht.total_volume_24h_usd)} · Top 10 pairs`,
      hl_top_pairs: ht,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "eth-beacon") {
    const eb = liveData?.eth_beacon ?? MOCK_ETH_BEACON;
    mockService = liveData ?? {
      service_type: "eth-beacon",
      result: `Epoch ${eb.epoch.toLocaleString()} · Block #${eb.block_number.toLocaleString()} · ${eb.gas_util_pct.toFixed(1)}% gas · Base fee ${eb.base_fee_gwei.toFixed(4)} Gwei`,
      eth_beacon: eb,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "restaking-tvl") {
    const rd = liveData?.restaking_tvl ?? MOCK_RESTAKING_TVL;
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`;
    mockService = liveData ?? {
      service_type: "restaking-tvl",
      result: `Total restaking: ${fmtTvl(rd.total_tvl)} · #1: ${rd.top_protocol} (${rd.dominant_pct.toFixed(1)}%) · ${rd.protocols.length} protocols`,
      restaking_tvl: rd,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "btc-halving") {
    const hv = liveData?.btc_halving ?? MOCK_BTC_HALVING;
    mockService = liveData ?? {
      service_type: "btc-halving",
      result: `Block ${hv.current_height.toLocaleString()} · Next halving in ${hv.blocks_remaining.toLocaleString()} blocks · ~${hv.estimated_days}d · ${hv.epoch_progress_pct.toFixed(1)}% through epoch`,
      btc_halving: hv,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "sol-validators") {
    const sv = liveData?.sol_validators ?? MOCK_SOL_VALIDATORS;
    mockService = liveData ?? {
      service_type: "sol-validators",
      result: `${sv.total_validators} validators · Top stake: ${sv.validators[0]?.activated_stake_sol.toFixed(0)}K SOL (${sv.validators[0]?.stake_pct.toFixed(2)}%) · Avg commission: ${sv.avg_commission.toFixed(1)}%`,
      sol_validators: sv,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "stable-yields") {
    const sy = liveData?.stable_yields ?? MOCK_STABLE_YIELDS;
    mockService = liveData ?? {
      service_type: "stable-yields",
      result: `Best: ${sy.highest_apy.toFixed(1)}% APY (${sy.highest_protocol}) · Avg: ${sy.avg_stablecoin_apy.toFixed(1)}% · ${sy.pools.length} pools · $${(sy.total_shown_tvl / 1e9).toFixed(1)}B TVL`,
      stable_yields: sy,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "eth-blob") {
    const eb = liveData?.eth_blob ?? MOCK_ETH_BLOB;
    const fmtBlobCostMock = (v: number) => v < 0.000001 ? v.toExponential(2) : v.toFixed(6);
    mockService = liveData ?? {
      service_type: "eth-blob",
      result: `Blob base fee: ${eb.blob_base_fee_gwei.toFixed(4)} gwei · ${eb.blobs_in_latest}/${eb.max_blobs_per_block} blobs · ${eb.fee_tier} · 1-blob cost: ${fmtBlobCostMock(eb.blob_cost_eth)} ETH`,
      eth_blob: eb,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "btc-treasury") {
    const bt = liveData?.btc_treasury ?? MOCK_BTC_TREASURY;
    const fmtBtc = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n.toFixed(0)}`;
    mockService = liveData ?? {
      service_type: "btc-treasury",
      result: `${fmtBtc(bt.total_holdings)} BTC ($${(bt.total_value_usd / 1e9).toFixed(1)}B) · ${bt.company_count} companies · #1: ${bt.top_holder} (${fmtBtc(bt.top_holder_btc)} BTC, ${bt.top_holder_pct.toFixed(1)}% of corp holdings)`,
      btc_treasury: bt,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "eth-supply") {
    const es = liveData?.eth_supply ?? MOCK_ETH_SUPPLY;
    const sign = es.net_per_hour >= 0 ? "+" : "";
    mockService = liveData ?? {
      service_type: "eth-supply",
      result: `${es.is_deflationary ? "Deflationary" : "Inflationary"} · Burn: ${es.burn_per_hour.toFixed(2)} ETH/hr · Issue: ${es.issuance_per_hour.toFixed(2)} ETH/hr · Net: ${sign}${es.net_per_hour.toFixed(2)} ETH/hr`,
      eth_supply: es,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "dao-governance") {
    const dg = liveData?.dao_governance ?? MOCK_DAO_GOVERNANCE;
    const active = dg.proposals.filter((p) => p.state === "active");
    const top = active[0] ?? dg.proposals[0];
    const dgResult = active.length > 0
      ? `${active.length} active proposal${active.length !== 1 ? "s" : ""} · ${top.dao_name}: "${top.title.slice(0, 60)}${top.title.length > 60 ? "…" : ""}" (${top.votes.toLocaleString()} votes)`
      : `${dg.proposals.length} recent proposals · ${dg.proposals[0]?.dao_name ?? "DAO"}: "${dg.proposals[0]?.title.slice(0, 60) ?? ""}…"`;
    mockService = liveData ?? {
      service_type: "dao-governance",
      result: dgResult,
      dao_governance: dg,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "crypto-correlation") {
    const cc = liveData?.crypto_correlation ?? MOCK_CRYPTO_CORRELATION;
    const top = cc.assets[0];
    const avg = cc.assets.length > 0
      ? (cc.assets.reduce((s, a) => s + a.correlation_30d, 0) / cc.assets.length).toFixed(2)
      : "0.00";
    const ccResult = top
      ? `${top.symbol}/BTC ρ=${top.correlation_30d.toFixed(2)} (${top.strength}) · avg ρ=${avg} · 30-day rolling vs BTC`
      : "Correlation data unavailable";
    mockService = liveData ?? {
      service_type: "crypto-correlation",
      result: ccResult,
      crypto_correlation: cc,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "chain-dev") {
    const cd = liveData?.chain_dev ?? MOCK_CHAIN_DEV;
    const top = cd.chains[0];
    const cdResult = top
      ? `${top.chain} most active: ${top.commits_4w} commits/4w · avg ${Math.round(cd.chains.reduce((s, e) => s + e.commits_4w, 0) / cd.chains.length)} commits/chain · ${cd.chains.length} chains`
      : "Developer activity unavailable";
    mockService = liveData ?? {
      service_type: "chain-dev",
      result: cdResult,
      chain_dev: cd,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "crypto-iv") {
    const iv = liveData?.implied_vol ?? MOCK_IMPLIED_VOL;
    mockService = liveData ?? {
      service_type: "crypto-iv",
      result: iv.assets.map((a) => `${a.symbol} IV: ${a.iv_current.toFixed(1)}% (${a.regime})`).join(" · "),
      implied_vol: iv,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "ath-distance") {
    const ad = liveData?.ath_distance ?? MOCK_ATH_DISTANCE;
    mockService = liveData ?? {
      service_type: "ath-distance",
      result: ad.coins.slice(0, 3).map((c) => `${c.symbol} ${c.ath_change_pct.toFixed(1)}% from ATH`).join(" · "),
      ath_distance: ad,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "deriv-overview") {
    const dov = liveData?.deriv_overview ?? MOCK_DERIV_OVERVIEW;
    mockService = liveData ?? {
      service_type: "deriv-overview",
      result: dov.assets.slice(0, 3).map((a) => `${a.index} OI $${(a.total_oi_usd / 1e9).toFixed(1)}B`).join(" · "),
      deriv_overview: dov,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "macro-signals") {
    const ms = liveData?.macro_signals ?? MOCK_MACRO_SIGNALS;
    mockService = liveData ?? {
      service_type: "macro-signals",
      result: ms.assets.map((a) => `${a.symbol} ${a.return_30d_pct >= 0 ? "+" : ""}${a.return_30d_pct.toFixed(1)}%`).join(" · "),
      macro_signals: ms,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "sol-priority-fees") {
    const pf = liveData?.sol_priority_fees ?? MOCK_SOL_PRIORITY_FEES;
    const fmt = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : n.toString();
    mockService = liveData ?? {
      service_type: "sol-priority-fees",
      result: `Congestion: ${pf.congestion} · Median ${fmt(pf.p50_micro_lamports)} µL/CU · P95 ${fmt(pf.p95_micro_lamports)} µL/CU`,
      sol_priority_fees: pf,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "sui-network") {
    const sn = liveData?.sui_network ?? MOCK_SUI_NETWORK;
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const fmtTx = (n: number) => n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : `${(n / 1e6).toFixed(0)}M`;
    const sign = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2);
    mockService = liveData ?? {
      service_type: "sui-network",
      result: `SUI $${sn.sui_price_usd.toFixed(3)} (${sign(sn.sui_change_24h)}%) · Epoch ${sn.epoch} · ${sn.active_validators} validators · TVL ${fmtTvl(sn.defi_tvl_usd)} · ${fmtTx(sn.total_transactions)} tx`,
      sui_network: sn,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "aptos-network") {
    const an = liveData?.aptos_network ?? { epoch: 15135, block_height: 671835000, ledger_version: 4620640000, active_validators: 114, apt_price_usd: 1.007, apt_change_24h: 4.4, defi_tvl_usd: 312000000 };
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const fmtNum = (n: number) => n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : `${(n / 1e6).toFixed(0)}M`;
    const sign = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2);
    mockService = liveData ?? {
      service_type: "aptos-network",
      result: `APT $${an.apt_price_usd.toFixed(3)} (${sign(an.apt_change_24h)}%) · Epoch ${an.epoch} · ${an.active_validators} validators · TVL ${fmtTvl(an.defi_tvl_usd)} · Block ${fmtNum(an.block_height)}`,
      aptos_network: an,
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

  if (service.service_type === "stablecoin-pegs" && service.stablecoin_pegs) {
    const sp = service.stablecoin_pegs;
    const fmtSupply = (v: number) =>
      v >= 1e12 ? `$${(v / 1e12).toFixed(2)}T` :
      v >= 1e9  ? `$${(v / 1e9).toFixed(1)}B` :
      `$${(v / 1e6).toFixed(0)}M`;
    const statusColor = (s: string) =>
      s === "on-peg" ? "#22c55e" : s === "warning" ? "#f59e0b" : "#ef4444";
    const statusBg = (s: string) =>
      s === "on-peg" ? "#f0fdf4" : s === "warning" ? "#fffbeb" : "#fef2f2";
    const devColor = (dev: number) =>
      Math.abs(dev) <= 0.1 ? "#22c55e" : Math.abs(dev) <= 0.5 ? "#f59e0b" : "#ef4444";
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0", display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>On-Peg</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#22c55e" }}>{sp.on_peg_count}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Warnings</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: sp.warning_count > 0 ? "#f59e0b" : "#888" }}>{sp.warning_count}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Depegged</div>
            <div style={{ fontWeight: 700, fontSize: 20, color: sp.depegged_count > 0 ? "#ef4444" : "#888" }}>{sp.depegged_count}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total Supply</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{fmtSupply(sp.total_supply_usd)}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Symbol</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Price</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Deviation</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Supply</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Status</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Backing</th>
            </tr>
          </thead>
          <tbody>
            {sp.stablecoins.map((s) => (
              <tr key={s.symbol} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "5px 6px", fontWeight: 700, color: "#222" }}>{s.symbol}</td>
                <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", color: "#222" }}>${s.price.toFixed(4)}</td>
                <td style={{ padding: "5px 6px", textAlign: "right", fontWeight: 600, color: devColor(s.dev_pct) }}>
                  {s.dev_pct >= 0 ? "+" : ""}{s.dev_pct.toFixed(2)}%
                </td>
                <td style={{ padding: "5px 6px", textAlign: "right", color: "#555" }}>{fmtSupply(s.circ_usd)}</td>
                <td style={{ padding: "5px 6px" }}>
                  <span style={{ background: statusBg(s.peg_status), color: statusColor(s.peg_status), padding: "2px 7px", borderRadius: 10, fontSize: 11, fontWeight: 600 }}>
                    {s.peg_status === "on-peg" ? "✓ on-peg" : s.peg_status === "warning" ? "⚠ warning" : "✗ depegged"}
                  </span>
                </td>
                <td style={{ padding: "5px 6px", color: "#888", fontSize: 11 }}>{s.peg_mechanism.replace("fiat-backed","fiat").replace("crypto-backed","crypto").replace("algorithmic","algo")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          {sp.stablecoins.length} USD-pegged stablecoins tracked · ±0.1% on-peg, ±0.5% warning · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "mining-pools" && service.mining_pools) {
    const mp = service.mining_pools;
    const fmtEh = (v: number) => `${v.toFixed(1)} EH/s`;
    const ncColor = mp.nakamoto_coefficient <= 2 ? "#ef4444" : mp.nakamoto_coefficient <= 3 ? "#f59e0b" : "#22c55e";
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0", display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Hashrate</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{fmtEh(mp.hashrate_eh)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Nakamoto Coeff</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: ncColor }}>{mp.nakamoto_coefficient}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Top-3 Share</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{mp.top3_concentration_pct}%</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Blocks (3d)</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{mp.total_blocks_3d.toLocaleString()}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>#</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Pool</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Blocks</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Share</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Bar</th>
            </tr>
          </thead>
          <tbody>
            {mp.pools.map((p) => {
              const barW = Math.round(p.share_pct * 2);
              const barColor = p.rank <= 2 ? "#f87171" : p.rank <= 4 ? "#fbbf24" : "#60a5fa";
              return (
                <tr key={p.slug} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "5px 6px", color: "#aaa", fontSize: 11 }}>{p.rank}</td>
                  <td style={{ padding: "5px 6px", fontWeight: 600, color: "#222" }}>{p.name}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", color: "#555" }}>{p.block_count}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontWeight: 700, color: p.rank === 1 ? "#ef4444" : "#333" }}>{p.share_pct}%</td>
                  <td style={{ padding: "5px 6px" }}>
                    <div style={{ height: 8, width: barW, background: barColor, borderRadius: 3 }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Nakamoto coefficient: {mp.nakamoto_coefficient} (pools needed for 51% attack) · {mp.window} window · via mempool.space
        </p>
      </div>
    );
  }

  if (service.service_type === "rwa-tvl" && service.rwa_tvl) {
    const rwa = service.rwa_tvl;
    const fmtUsd = (v: number) =>
      v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toLocaleString()}`;
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0", display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total RWA TVL</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{fmtUsd(rwa.total_tvl_usd)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Protocols</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{rwa.protocol_count}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Top Chain</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{rwa.top_chain}</div>
          </div>
          {rwa.week_change_pct != null && (
            <div>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>7d Change</div>
              <div style={{ fontWeight: 600, fontSize: 15, color: rwa.week_change_pct >= 0 ? "#22c55e" : "#ef4444" }}>
                {rwa.week_change_pct >= 0 ? "+" : ""}{rwa.week_change_pct}%
              </div>
            </div>
          )}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Protocol</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>TVL</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>1d</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>7d</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Chains</th>
            </tr>
          </thead>
          <tbody>
            {rwa.protocols.map((p) => {
              const fmt1d = p.change_1d_pct != null ? `${p.change_1d_pct >= 0 ? "+" : ""}${p.change_1d_pct}%` : "—";
              const fmt7d = p.change_7d_pct != null ? `${p.change_7d_pct >= 0 ? "+" : ""}${p.change_7d_pct}%` : "—";
              const color1d = p.change_1d_pct == null ? "#aaa" : p.change_1d_pct >= 0 ? "#22c55e" : "#ef4444";
              const color7d = p.change_7d_pct == null ? "#aaa" : p.change_7d_pct >= 0 ? "#22c55e" : "#ef4444";
              return (
                <tr key={p.slug} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "5px 6px", fontWeight: 600, color: "#222" }}>{p.name}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", color: "#333" }}>{fmtUsd(p.tvl_usd)}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", color: color1d, fontFamily: "monospace", fontSize: 12 }}>{fmt1d}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", color: color7d, fontFamily: "monospace", fontSize: 12 }}>{fmt7d}</td>
                  <td style={{ padding: "5px 6px", color: "#888", fontSize: 11 }}>{p.chains.slice(0, 2).join(", ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Real World Assets (tokenized treasuries, credit, real estate) · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "crypto-funding" && service.crypto_funding) {
    const cf = service.crypto_funding;
    const fmtAmt = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(1)}B` : `$${v}M`;
    const fmtDate = (ts: number) => {
      const d = new Date(ts * 1000);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    };
    const ROUND_COLORS: Record<string, string> = {
      "Seed": "#6366f1",
      "Pre-Seed": "#8b5cf6",
      "Series A": "#0ea5e9",
      "Series B": "#22c55e",
      "Series C": "#f59e0b",
      "Strategic": "#64748b",
    };
    const roundColor = (r: string) => ROUND_COLORS[r] ?? "#94a3b8";
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0", display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total Raised (30d)</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{fmtAmt(cf.total_raised_usd_m)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Rounds</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{cf.round_count}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Top Category</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{cf.top_category}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Largest Round</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#333" }}>{cf.rounds[0]?.name} {fmtAmt(cf.rounds[0]?.amount_usd_m ?? 0)}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Project</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Amount</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Round</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Category</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Lead Investor</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {cf.rounds.map((r, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                <td style={{ padding: "5px 6px", fontWeight: 600, color: "#222" }}>{r.name}</td>
                <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", color: "#333", fontWeight: 700 }}>{fmtAmt(r.amount_usd_m)}</td>
                <td style={{ padding: "5px 6px" }}>
                  <span style={{ background: roundColor(r.round) + "22", color: roundColor(r.round), border: `1px solid ${roundColor(r.round)}44`, borderRadius: 4, padding: "1px 6px", fontSize: 11, fontWeight: 600 }}>{r.round}</span>
                </td>
                <td style={{ padding: "5px 6px", color: "#666", fontSize: 12 }}>{r.category}</td>
                <td style={{ padding: "5px 6px", color: "#888", fontSize: 11 }}>{r.lead_investors[0] ?? "—"}</td>
                <td style={{ padding: "5px 6px", textAlign: "right", color: "#aaa", fontSize: 11 }}>{fmtDate(r.date_ts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Top {cf.round_count} rounds by amount · last {cf.period_days} days · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "chain-fees" && service.chain_fees) {
    const cf = service.chain_fees;
    const fmtUsd = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v.toFixed(0)}`;
    const maxFees = cf.chains[0]?.fees_24h ?? 1;
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0", display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total 24h Fees</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{fmtUsd(cf.total_24h)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Top Chain</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{cf.top_chain}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Chains Tracked</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{cf.chains.length}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Chain</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>24h Fees</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>1d Change</th>
              <th style={{ padding: "4px 6px", color: "#aaa", fontWeight: 500, width: 120 }}>Share</th>
            </tr>
          </thead>
          <tbody>
            {cf.chains.map((c, i) => {
              const sharePct = (c.fees_24h / cf.total_24h) * 100;
              const barWidth = Math.round((c.fees_24h / maxFees) * 100);
              const chg = c.change_1d_pct;
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "5px 6px", fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "#111" : "#333" }}>{c.chain}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", fontWeight: 600, color: "#333" }}>{fmtUsd(c.fees_24h)}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", fontSize: 12, color: chg == null ? "#aaa" : chg >= 0 ? "#16a34a" : "#dc2626" }}>
                    {chg == null ? "—" : `${chg >= 0 ? "+" : ""}${chg.toFixed(1)}%`}
                  </td>
                  <td style={{ padding: "5px 6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${barWidth}%`, height: "100%", background: i === 0 ? "#6366f1" : "#94a3b8", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#999", width: 32, textAlign: "right" }}>{sharePct.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          24-hour fee revenue by blockchain · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "chain-tvl" && service.chain_tvl) {
    const ct = service.chain_tvl;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;
    const maxTvl = ct.chains[0]?.tvl ?? 1;
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#fafafa", borderRadius: 8, border: "1px solid #f0f0f0", display: "flex", gap: 28, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total DeFi TVL</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{fmtUsd(ct.total_tvl)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>ETH Dominance</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#6366f1" }}>{ct.eth_dominance_pct.toFixed(1)}%</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Top Chain</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{ct.top_chain}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Chain</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>TVL</th>
              <th style={{ padding: "4px 6px", color: "#aaa", fontWeight: 500, width: 140 }}>Share</th>
            </tr>
          </thead>
          <tbody>
            {ct.chains.map((c, i) => {
              const barWidth = Math.round((c.tvl / maxTvl) * 100);
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "5px 6px", fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "#111" : "#333" }}>{c.name}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", fontWeight: 600, color: "#333" }}>{fmtUsd(c.tvl)}</td>
                  <td style={{ padding: "5px 6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${barWidth}%`, height: "100%", background: i === 0 ? "#6366f1" : "#94a3b8", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#999", width: 36, textAlign: "right" }}>{c.share_pct.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          TVL by blockchain · {ct.chains.length} chains tracked · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "defi-exploits" && service.defi_exploits) {
    const de = service.defi_exploits;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${(v / 1e3).toFixed(0)}K`;
    const fmtDate = (ts: number) => new Date(ts * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const maxAmount = de.incidents[0]?.amount ?? 1;
    const classColor = (c: string) => {
      if (c === "Rug Pull") return "#ef4444";
      if (c === "Access Control") return "#f97316";
      if (c === "Protocol Logic") return "#eab308";
      if (c === "Oracle Exploit") return "#8b5cf6";
      return "#6b7280";
    };
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#fff5f5", borderRadius: 8, border: "1px solid #fecaca", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Incidents (90d)</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#ef4444" }}>{de.incident_count}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total Stolen</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{fmtUsd(de.total_stolen_usd)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Most Targeted</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{de.most_targeted_chain}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Protocol</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Stolen</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Type</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {de.incidents.map((inc, i) => {
              const barWidth = Math.round((inc.amount / maxAmount) * 100);
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "5px 6px", fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "#111" : "#333" }}>
                    <div>{inc.name}</div>
                    <div style={{ height: 3, background: "#f0f0f0", borderRadius: 2, marginTop: 3, overflow: "hidden" }}>
                      <div style={{ width: `${barWidth}%`, height: "100%", background: i === 0 ? "#ef4444" : "#fca5a5", borderRadius: 2 }} />
                    </div>
                  </td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", fontWeight: 600, color: "#dc2626" }}>{fmtUsd(inc.amount)}</td>
                  <td style={{ padding: "5px 6px" }}>
                    <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, background: "#f5f5f5", color: classColor(inc.classification), fontWeight: 600 }}>
                      {inc.classification}
                    </span>
                  </td>
                  <td style={{ padding: "5px 6px", textAlign: "right", color: "#999", fontSize: 12 }}>{fmtDate(inc.date)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Top {de.incidents.length} exploits by size · {de.incident_count} total incidents in {de.period_days}d · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "global-dex" && service.global_dex) {
    const gd = service.global_dex;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;
    const maxVol = gd.dexes[0]?.volume_24h ?? 1;
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total 24h DEX Volume</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#0369a1" }}>{fmtUsd(gd.total_volume_24h)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>DEXes Ranked</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{gd.dexes.length}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Top DEX</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{gd.dexes[0]?.name}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>#</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>DEX</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>24h Vol</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>24h Chg</th>
            </tr>
          </thead>
          <tbody>
            {gd.dexes.map((dex, i) => {
              const barWidth = Math.round((dex.volume_24h / maxVol) * 100);
              const isUp = dex.change_pct >= 0;
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "5px 6px", color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: "5px 6px" }}>
                    <div style={{ fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "#111" : "#333" }}>{dex.name}</div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{dex.chains.join(" · ")}</div>
                    <div style={{ height: 3, background: "#f0f0f0", borderRadius: 2, marginTop: 3, overflow: "hidden" }}>
                      <div style={{ width: `${barWidth}%`, height: "100%", background: i === 0 ? "#0369a1" : "#93c5fd", borderRadius: 2 }} />
                    </div>
                  </td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", fontWeight: 600, color: "#111" }}>{fmtUsd(dex.volume_24h)}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontWeight: 600, color: isUp ? "#16a34a" : "#dc2626", fontSize: 12 }}>
                    {isUp ? "+" : ""}{dex.change_pct.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Top {gd.dexes.length} DEXes by 24h trading volume across all chains · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "futures-basis" && service.futures_basis) {
    const fb = service.futures_basis;
    const fmtPrice = (v: number, decimals = 0) => `$${v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
    const fmtBasis = (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(3)}%`;
    const basisColor = (v: number) => v >= 0 ? "#16a34a" : "#dc2626";

    const renderTable = (entries: FuturesBasisEntry[], currency: string, spot: number) => {
      const dated = entries.filter((e) => e.days_to_expiry > 0);
      return (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{currency}</span>
            <span style={{ fontSize: 12, color: "#666" }}>Spot: <strong>{fmtPrice(spot)}</strong></span>
            {dated.length > 0 && (
              <span style={{ fontSize: 11, color: "#888", background: "#f0f0f0", padding: "2px 7px", borderRadius: 10 }}>
                {dated.every((e) => (e.annualized_basis_pct ?? 0) >= 0) ? "Contango ▲" : "Backwardation ▼"}
              </span>
            )}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                <th style={{ textAlign: "left",  padding: "3px 6px", color: "#aaa", fontWeight: 500 }}>Expiry</th>
                <th style={{ textAlign: "right", padding: "3px 6px", color: "#aaa", fontWeight: 500 }}>Days</th>
                <th style={{ textAlign: "right", padding: "3px 6px", color: "#aaa", fontWeight: 500 }}>Mark Price</th>
                <th style={{ textAlign: "right", padding: "3px 6px", color: "#aaa", fontWeight: 500 }}>Basis $</th>
                <th style={{ textAlign: "right", padding: "3px 6px", color: "#aaa", fontWeight: 500 }}>Basis %</th>
                <th style={{ textAlign: "right", padding: "3px 6px", color: "#aaa", fontWeight: 500 }}>Ann. %</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f5f5f5", background: e.days_to_expiry === 0 ? "#fafafa" : "transparent" }}>
                  <td style={{ padding: "4px 6px", fontWeight: e.days_to_expiry === 0 ? 600 : 400, color: "#333" }}>{e.expiry_label}</td>
                  <td style={{ padding: "4px 6px", textAlign: "right", color: "#aaa" }}>{e.days_to_expiry === 0 ? "—" : e.days_to_expiry}</td>
                  <td style={{ padding: "4px 6px", textAlign: "right", fontFamily: "monospace", color: "#111" }}>{fmtPrice(e.mark_price, currency === "BTC" ? 0 : 2)}</td>
                  <td style={{ padding: "4px 6px", textAlign: "right", fontFamily: "monospace", color: basisColor(e.basis_usd) }}>{e.basis_usd >= 0 ? "+" : ""}{currency === "BTC" ? e.basis_usd.toFixed(0) : e.basis_usd.toFixed(2)}</td>
                  <td style={{ padding: "4px 6px", textAlign: "right", fontWeight: 600, color: basisColor(e.basis_pct) }}>{fmtBasis(e.basis_pct)}</td>
                  <td style={{ padding: "4px 6px", textAlign: "right", color: e.annualized_basis_pct != null ? basisColor(e.annualized_basis_pct) : "#bbb" }}>
                    {e.annualized_basis_pct != null ? `${e.annualized_basis_pct >= 0 ? "+" : ""}${e.annualized_basis_pct.toFixed(2)}%` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    };

    return (
      <div>
        <div style={{ marginBottom: 14, padding: 10, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", fontSize: 12, color: "#555" }}>
          Basis = futures mark price − spot. Annualized basis = basis% × (365 / days). Positive = contango (market pays premium for future delivery). Via Deribit.
        </div>
        {renderTable(fb.btc, "BTC", fb.btc_spot)}
        {renderTable(fb.eth, "ETH", fb.eth_spot)}
      </div>
    );
  }

  if (service.service_type === "dex-aggregators" && service.dex_aggregators) {
    const da = service.dex_aggregators;
    const fmtUsd = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;
    const maxVol = da.aggregators[0]?.volume_24h ?? 1;
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total Aggregator Volume (24h)</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#0369a1" }}>{fmtUsd(da.total_volume_24h)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>7d Volume</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{fmtUsd(da.total_volume_7d)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Top Aggregator</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{da.aggregators[0]?.name}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>#</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Aggregator</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>24h Vol</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>7d Vol</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>24h Chg</th>
            </tr>
          </thead>
          <tbody>
            {da.aggregators.map((agg, i) => {
              const barWidth = Math.round((agg.volume_24h / maxVol) * 100);
              const isUp = (agg.change_pct ?? 0) >= 0;
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "5px 6px", color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: "5px 6px" }}>
                    <div style={{ fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "#111" : "#333" }}>{agg.name}</div>
                    <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{agg.chains.join(" · ")}</div>
                    <div style={{ height: 3, background: "#f0f0f0", borderRadius: 2, marginTop: 3, overflow: "hidden" }}>
                      <div style={{ width: `${barWidth}%`, height: "100%", background: i === 0 ? "#0369a1" : "#93c5fd", borderRadius: 2 }} />
                    </div>
                  </td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", fontWeight: 600, color: "#111" }}>{fmtUsd(agg.volume_24h)}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", color: "#666" }}>{fmtUsd(agg.volume_7d)}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontWeight: 600, fontSize: 12,
                    color: agg.change_pct == null ? "#bbb" : isUp ? "#16a34a" : "#dc2626" }}>
                    {agg.change_pct == null ? "—" : `${isUp ? "+" : ""}${agg.change_pct.toFixed(1)}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Top {da.aggregators.length} DEX aggregators by 24h routed volume · via DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "meme-coins" && service.meme_coins) {
    const mc = service.meme_coins;
    const fmtPrice = (v: number) => v < 0.000001 ? v.toExponential(2) : v < 0.01 ? v.toPrecision(4) : v >= 1000 ? `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : `$${v.toPrecision(4)}`;
    const fmtMcap = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;
    const maxMcap = mc.coins[0]?.market_cap_usd ?? 1;
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#fdf4ff", borderRadius: 8, border: "1px solid #e9d5ff", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total Meme Mcap</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#7c3aed" }}>{fmtMcap(mc.total_market_cap_usd)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Top Gainer (24h)</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#16a34a" }}>{mc.top_gainer}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Biggest Drop (24h)</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#dc2626" }}>{mc.top_loser}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>#</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Coin</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Price</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>24h</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Mkt Cap</th>
            </tr>
          </thead>
          <tbody>
            {mc.coins.map((c, i) => {
              const isUp = (c.change_24h_pct ?? 0) >= 0;
              const barWidth = Math.round((c.market_cap_usd / maxMcap) * 100);
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "5px 6px", color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: "5px 6px" }}>
                    <div style={{ fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "#111" : "#333" }}>
                      {c.symbol} <span style={{ color: "#999", fontWeight: 400, fontSize: 11 }}>{c.name}</span>
                    </div>
                    <div style={{ height: 3, background: "#f0f0f0", borderRadius: 2, marginTop: 3, overflow: "hidden" }}>
                      <div style={{ width: `${barWidth}%`, height: "100%", background: i === 0 ? "#7c3aed" : "#c4b5fd", borderRadius: 2 }} />
                    </div>
                  </td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", fontSize: 12, color: "#111" }}>{fmtPrice(c.price_usd)}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontWeight: 600, fontSize: 12,
                    color: c.change_24h_pct == null ? "#bbb" : isUp ? "#16a34a" : "#dc2626" }}>
                    {c.change_24h_pct == null ? "—" : `${isUp ? "+" : ""}${c.change_24h_pct.toFixed(2)}%`}
                  </td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", color: "#555", fontSize: 12 }}>{fmtMcap(c.market_cap_usd)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Top {mc.coins.length} meme coins by market cap · via CoinGecko
        </p>
      </div>
    );
  }

  if (service.service_type === "cross-chain-gas" && service.cross_chain_gas) {
    const ccg = service.cross_chain_gas;
    const ethL1Cost = ccg.chains.find((c) => c.chain === "Ethereum L1")?.transfer_cost_usd ?? 1;
    const maxCost = Math.max(...ccg.chains.map((c) => c.transfer_cost_usd));
    const fmtCost = (v: number) => v < 0.0001 ? `$${v.toFixed(6)}` : v < 0.01 ? `$${v.toFixed(5)}` : `$${v.toFixed(4)}`;
    const chainColors: Record<string, string> = {
      "Ethereum L1": "#627EEA",
      "Base":        "#0052FF",
      "Arbitrum":    "#12AAFF",
      "Optimism":    "#FF0420",
      "BNB Chain":   "#F0B90B",
      "Solana":      "#9945FF",
    };
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Cheapest Chain</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#0369a1" }}>{ccg.cheapest}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>ETH L1 Gas</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#333" }}>{ccg.eth_base_fee_gwei} Gwei</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>ETH L1 Transfer Cost</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#333" }}>{fmtCost(ethL1Cost)}</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>#</th>
              <th style={{ textAlign: "left", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Chain</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Gas (Gwei)</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Transfer Cost</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>vs ETH L1</th>
            </tr>
          </thead>
          <tbody>
            {ccg.chains.map((c, i) => {
              const barWidth = maxCost > 0 ? Math.max(2, Math.round((c.transfer_cost_usd / maxCost) * 100)) : 0;
              const accent = chainColors[c.chain] ?? "#888";
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "5px 6px", color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: "5px 6px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: i === 0 ? 700 : 500, color: i === 0 ? "#111" : "#333" }}>{c.chain}</div>
                        <div style={{ height: 3, background: "#f0f0f0", borderRadius: 2, marginTop: 3, overflow: "hidden", width: 80 }}>
                          <div style={{ width: `${barWidth}%`, height: "100%", background: accent, borderRadius: 2, opacity: 0.8 }} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", color: "#555", fontSize: 12 }}>
                    {c.gas_price_gwei != null ? c.gas_price_gwei.toFixed(3) : <span style={{ color: "#aaa" }}>5k lam</span>}
                  </td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", fontWeight: i === 0 ? 700 : 600, color: i === 0 ? "#16a34a" : "#111" }}>
                    {fmtCost(c.transfer_cost_usd)}
                  </td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontSize: 12,
                    color: c.chain === "Ethereum L1" ? "#888" : c.relative_pct <= 5 ? "#16a34a" : c.relative_pct <= 20 ? "#ca8a04" : "#dc2626" }}>
                    {c.chain === "Ethereum L1" ? "baseline" : c.relative_pct < 1 ? `<1%` : `${c.relative_pct}%`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Simple transfer (21k gas EVM / 5k lamports Solana) · live via public RPC endpoints
        </p>
      </div>
    );
  }

  if (service.service_type === "hl-top-pairs" && service.hl_top_pairs) {
    const ht = service.hl_top_pairs;
    const fmtVol = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(0)}M` : `$${v.toFixed(0)}`;
    const fmtOI  = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const fmtFunding = (r: number) => {
      const pct = r * 100;
      const sign = pct >= 0 ? "+" : "";
      return `${sign}${pct.toFixed(4)}%`;
    };
    const maxVol = ht.pairs[0]?.volume_24h_usd ?? 1;
    return (
      <div>
        <div style={{ marginBottom: 12, padding: 12, background: "#f0fdf4", borderRadius: 8, border: "1px solid #bbf7d0", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Total 24h Volume</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#15803d" }}>{fmtVol(ht.total_volume_24h_usd)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>#1 Asset</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#222" }}>{ht.top_pair}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>Top 10 Pairs</div>
            <div style={{ fontWeight: 600, fontSize: 15, color: "#555" }}>{ht.pairs.length} shown</div>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <th style={{ textAlign: "left",  padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>#</th>
              <th style={{ textAlign: "left",  padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Pair</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>24h Vol</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Price</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>24h %</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>OI</th>
              <th style={{ textAlign: "right", padding: "4px 6px", color: "#aaa", fontWeight: 500 }}>Funding/h</th>
            </tr>
          </thead>
          <tbody>
            {ht.pairs.map((p, i) => {
              const barWidth = Math.max(2, Math.round((p.volume_24h_usd / maxVol) * 100));
              const changeColor = p.price_change_pct >= 0 ? "#16a34a" : "#dc2626";
              const fundingColor = p.funding_rate > 0.0001 ? "#dc2626" : p.funding_rate < -0.0001 ? "#2563eb" : "#888";
              const priceStr = p.mark_price >= 1000
                ? `$${p.mark_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : p.mark_price >= 1
                ? `$${p.mark_price.toFixed(4)}`
                : `$${p.mark_price.toFixed(6)}`;
              return (
                <tr key={i} style={{ borderBottom: "1px solid #f5f5f5" }}>
                  <td style={{ padding: "5px 6px", color: "#aaa", fontSize: 12 }}>{i + 1}</td>
                  <td style={{ padding: "5px 6px" }}>
                    <div style={{ fontWeight: i < 3 ? 700 : 600, color: i === 0 ? "#111" : "#333" }}>{p.symbol}-PERP</div>
                    <div style={{ height: 3, background: "#f0f0f0", borderRadius: 2, marginTop: 3, overflow: "hidden", width: 80 }}>
                      <div style={{ width: `${barWidth}%`, height: "100%", background: i === 0 ? "#15803d" : "#86efac", borderRadius: 2 }} />
                    </div>
                  </td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", fontWeight: i === 0 ? 700 : 600, color: "#111" }}>{fmtVol(p.volume_24h_usd)}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", color: "#555", fontSize: 12 }}>{priceStr}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", fontSize: 12, color: changeColor, fontWeight: 600 }}>
                    {p.price_change_pct >= 0 ? "+" : ""}{p.price_change_pct.toFixed(2)}%
                  </td>
                  <td style={{ padding: "5px 6px", textAlign: "right", color: "#888", fontSize: 12 }}>{fmtOI(p.open_interest_usd)}</td>
                  <td style={{ padding: "5px 6px", textAlign: "right", fontFamily: "monospace", fontSize: 11, color: fundingColor, fontWeight: 600 }}>{fmtFunding(p.funding_rate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
          Top 10 perps by 24h notional volume · Funding rate is hourly · via Hyperliquid public API
        </p>
      </div>
    );
  }

  if (service.service_type === "eth-beacon" && service.eth_beacon) {
    const eb = service.eth_beacon;
    const finalityColor = eb.is_finalizing ? "#15803d" : eb.finality_lag <= 5 ? "#ca8a04" : "#dc2626";
    const finalityLabel = eb.is_finalizing ? "Finalizing" : eb.finality_lag <= 5 ? "Slow" : "At Risk";
    const gasColor = eb.gas_util_pct > 80 ? "#dc2626" : eb.gas_util_pct > 50 ? "#ca8a04" : "#15803d";
    const baseFeeStr = eb.base_fee_gwei < 1
      ? eb.base_fee_gwei.toFixed(4) + " Gwei"
      : eb.base_fee_gwei.toFixed(2) + " Gwei";
    const slotProgress = Math.round((eb.slot_in_epoch / 32) * 100);
    const clStats = [
      { label: "Current Epoch", value: eb.epoch.toLocaleString(), sub: `Slot ${eb.slot.toLocaleString()} (${eb.slot_in_epoch}/32)` },
      { label: "Finalized Epoch", value: eb.finalized_epoch.toLocaleString(), sub: `${eb.finality_lag} epochs behind head`, color: finalityColor },
    ];
    const elStats = [
      { label: "Block Height", value: `#${eb.block_number.toLocaleString()}`, sub: "latest execution block" },
      { label: "Base Fee", value: baseFeeStr, sub: `${eb.gas_util_pct.toFixed(1)}% gas utilization`, color: gasColor },
    ];
    return (
      <div>
        <div style={{ marginBottom: 8, padding: "6px 10px", background: eb.is_finalizing ? "#f0fdf4" : "#fef9c3", borderRadius: 6, border: `1px solid ${eb.is_finalizing ? "#bbf7d0" : "#fde68a"}`, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: finalityColor, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: finalityColor }}>{finalityLabel}</span>
          <span style={{ fontSize: 12, color: "#888" }}>· {eb.is_finalizing ? "Chain is finalizing normally" : `Finality lagging by ${eb.finality_lag} epochs`}</span>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, color: "#aaa", marginBottom: 3 }}>Epoch Progress ({eb.slot_in_epoch}/32 slots)</div>
          <div style={{ height: 6, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${slotProgress}%`, height: "100%", background: "#818cf8", borderRadius: 3, transition: "width 0.3s" }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 11, color: "#999", marginBottom: 1 }}>Consensus Layer</div>
          </div>
          <div style={{ padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
            <div style={{ fontSize: 11, color: "#999", marginBottom: 1 }}>Execution Layer</div>
          </div>
          {clStats.map((s, i) => (
            <div key={i} style={{ padding: 10, background: "#f8f9fa", borderRadius: 8, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: s.color ?? "#111" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{s.sub}</div>
            </div>
          ))}
          {elStats.map((s, i) => (
            <div key={i} style={{ padding: 10, background: "#f8f9fa", borderRadius: 8, border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: s.color ?? "#111" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#999", marginTop: 1 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 6, fontSize: 12, color: "#888" }}>
          Ethereum network health · CL via publicnode.com Beacon API · EL via Ethereum JSON-RPC
        </p>
      </div>
    );
  }

  if (service.service_type === "restaking-tvl" && service.restaking_tvl) {
    const rd = service.restaking_tvl;
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const fmtChg = (v: number | null) => v == null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
    const chgColor = (v: number | null) => v == null ? "#999" : v >= 0 ? "#15803d" : "#dc2626";
    return (
      <div>
        <div style={{ marginBottom: 10, padding: "6px 10px", background: "#f0f9ff", borderRadius: 6, border: "1px solid #bae6fd" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#0369a1" }}>Total Restaking TVL: {fmtTvl(rd.total_tvl)}</span>
          <span style={{ fontSize: 12, color: "#666", marginLeft: 8 }}>· {rd.top_protocol} dominates ({rd.dominant_pct.toFixed(1)}%)</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {rd.protocols.slice(0, 8).map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", background: i === 0 ? "#f8faff" : "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb" }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#111" }}>{p.name}</span>
                <span style={{ fontSize: 11, color: "#888", marginLeft: 6 }}>{p.category}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{fmtTvl(p.tvl)}</div>
                <div style={{ fontSize: 11 }}>
                  <span style={{ color: chgColor(p.change_1d_pct) }}>{fmtChg(p.change_1d_pct)} 1d</span>
                  <span style={{ color: "#ccc", margin: "0 3px" }}>·</span>
                  <span style={{ color: chgColor(p.change_7d_pct) }}>{fmtChg(p.change_7d_pct)} 7d</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>Restaking economy · Via DeFi Llama</p>
      </div>
    );
  }

  if (service.service_type === "btc-halving" && service.btc_halving) {
    const hv = service.btc_halving;
    const progressWidth = Math.min(100, Math.max(0, hv.epoch_progress_pct));
    return (
      <div>
        {/* Countdown header */}
        <div style={{ marginBottom: 10, padding: "8px 12px", background: "#fffbeb", borderRadius: 6, border: "1px solid #fcd34d" }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#92400e" }}>
            🔢 Next Halving: Block {hv.next_halving_height.toLocaleString()}
          </div>
          <div style={{ fontSize: 13, color: "#78350f", marginTop: 2 }}>
            {hv.blocks_remaining.toLocaleString()} blocks remaining · est. {hv.estimated_date} (~{hv.estimated_days} days)
          </div>
        </div>

        {/* Epoch progress bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666", marginBottom: 4 }}>
            <span>Epoch Progress</span>
            <span>{hv.epoch_progress_pct.toFixed(1)}%</span>
          </div>
          <div style={{ height: 10, background: "#e5e7eb", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressWidth}%`, background: "linear-gradient(90deg, #f59e0b, #d97706)", borderRadius: 5 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#999", marginTop: 2 }}>
            <span>Block {(hv.next_halving_height - 210_000).toLocaleString()}</span>
            <span>Block {hv.next_halving_height.toLocaleString()}</span>
          </div>
        </div>

        {/* Key stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ padding: "8px 10px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Current Block</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{hv.current_height.toLocaleString()}</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Block Reward</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#f59e0b" }}>{hv.current_reward_btc} BTC</div>
            <div style={{ fontSize: 11, color: "#999" }}>→ {hv.next_reward_btc} BTC</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Supply Mined</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{hv.supply_mined_pct.toFixed(1)}%</div>
            <div style={{ fontSize: 11, color: "#999" }}>of 21M BTC</div>
          </div>
        </div>

        {/* Historical halvings */}
        <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Halving History</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {hv.halvings.map((h) => (
            <div key={h.number} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 10px", background: "#fafafa", borderRadius: 5, border: "1px solid #e5e7eb" }}>
              <div>
                <span style={{ fontWeight: 600, fontSize: 12, color: "#111" }}>#{h.number} — {h.date_approx}</span>
                <span style={{ fontSize: 11, color: "#888", marginLeft: 6 }}>Block {h.block_height.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 12, color: "#555" }}>
                {h.reward_before_btc} → <span style={{ fontWeight: 700, color: "#f59e0b" }}>{h.reward_after_btc} BTC</span>
              </div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>Avg block time: {hv.avg_block_time_secs}s · Via mempool.space</p>
      </div>
    );
  }

  if (service.service_type === "sol-validators" && service.sol_validators) {
    const sv = service.sol_validators;
    return (
      <div>
        {/* Network summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ padding: "8px 10px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #86efac", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Validators</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{sv.total_validators.toLocaleString()}</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #86efac", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Total Staked</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{sv.total_stake_sol.toFixed(1)}M SOL</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #86efac", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Delinquent</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: sv.delinquent_count > 20 ? "#dc2626" : "#111" }}>{sv.delinquent_count}</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #86efac", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Avg Commission</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{sv.avg_commission.toFixed(1)}%</div>
          </div>
        </div>

        {/* Top 10 validators table */}
        <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Top 10 Validators by Stake</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {sv.validators.map((v) => (
            <div key={v.rank} style={{ display: "flex", alignItems: "center", padding: "5px 10px", background: "#fafafa", borderRadius: 5, border: "1px solid #e5e7eb", gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#9ca3af", width: 18, textAlign: "right", flexShrink: 0 }}>#{v.rank}</div>
              <div style={{ fontFamily: "monospace", fontSize: 11, color: "#374151", flex: 1 }}>{v.node_pubkey_short}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111", minWidth: 70, textAlign: "right" }}>{v.activated_stake_sol.toFixed(0)}K SOL</div>
              <div style={{ fontSize: 11, color: "#6b7280", minWidth: 40, textAlign: "right" }}>{v.stake_pct.toFixed(2)}%</div>
              <div style={{ fontSize: 11, color: v.commission === 0 ? "#16a34a" : "#555", minWidth: 38, textAlign: "right" }}>{v.commission}% fee</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>Solana mainnet-beta · Via Solana RPC</p>
      </div>
    );
  }

  if (service.service_type === "stable-yields" && service.stable_yields) {
    const sy = service.stable_yields;
    const fmtTvl = (v: number) =>
      v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const apyColor = (apy: number) =>
      apy >= 8 ? "#16a34a" : apy >= 5 ? "#2563eb" : "#374151";
    return (
      <div>
        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ padding: "8px 10px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #86efac", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Best APY</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#16a34a" }}>{sy.highest_apy.toFixed(1)}%</div>
            <div style={{ fontSize: 10, color: "#888" }}>{sy.highest_protocol}</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Avg APY</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#2563eb" }}>{sy.avg_stablecoin_apy.toFixed(1)}%</div>
            <div style={{ fontSize: 10, color: "#888" }}>{sy.pools.length} pools</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Total TVL</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{fmtTvl(sy.total_shown_tvl)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>shown pools</div>
          </div>
        </div>

        {/* Pool table */}
        <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Top Stablecoin Yield Pools (sorted by APY)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {sy.pools.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "5px 10px", background: "#fafafa", borderRadius: 5, border: "1px solid #e5e7eb", gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#9ca3af", width: 18, textAlign: "right", flexShrink: 0 }}>#{i + 1}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111", flex: 1 }}>{p.protocol}</div>
              <div style={{ fontSize: 11, color: "#6b7280", minWidth: 60 }}>{p.chain}</div>
              <div style={{ fontSize: 11, color: "#374151", minWidth: 36, textAlign: "right" }}>{p.symbol}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: apyColor(p.apy_pct), minWidth: 52, textAlign: "right" }}>{p.apy_pct.toFixed(2)}%</div>
              <div style={{ fontSize: 11, color: "#9ca3af", minWidth: 54, textAlign: "right" }}>{fmtTvl(p.tvl_usd)}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>APY ≤30% · TVL ≥$5M · Via DeFi Llama yields API</p>
      </div>
    );
  }

  if (service.service_type === "btc-treasury" && service.btc_treasury) {
    const bt = service.btc_treasury;
    const fmtBtc = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : `${n.toFixed(0)}`;
    const fmtUsd = (n: number) => n >= 1e9 ? `$${(n / 1e9).toFixed(1)}B` : `$${(n / 1e6).toFixed(0)}M`;
    return (
      <div>
        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ padding: "8px 10px", background: "#fffbeb", borderRadius: 6, border: "1px solid #fde68a", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Total Holdings</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#b45309" }}>{fmtBtc(bt.total_holdings)} BTC</div>
            <div style={{ fontSize: 10, color: "#888" }}>{fmtUsd(bt.total_value_usd)}</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Companies</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{bt.company_count}</div>
            <div style={{ fontSize: 10, color: "#888" }}>public holders</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Mcap Dominance</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#2563eb" }}>{bt.market_cap_dominance.toFixed(2)}%</div>
            <div style={{ fontSize: 10, color: "#888" }}>of crypto market</div>
          </div>
        </div>

        {/* Top holders table */}
        <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>Top 10 Corporate Holders (by BTC)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {bt.top_companies.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "5px 10px", background: i === 0 ? "#fffbeb" : "#fafafa", borderRadius: 5, border: `1px solid ${i === 0 ? "#fde68a" : "#e5e7eb"}`, gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 12, color: "#9ca3af", width: 18, textAlign: "right", flexShrink: 0 }}>#{i + 1}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111", flex: 1 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "#6b7280", minWidth: 56 }}>{c.symbol}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", minWidth: 22 }}>{c.country}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#b45309", minWidth: 60, textAlign: "right" }}>{fmtBtc(c.total_btc)}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", minWidth: 54, textAlign: "right" }}>{fmtUsd(c.value_usd)}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>Public companies only · Via CoinGecko public treasury API</p>
      </div>
    );
  }

  if (service.service_type === "eth-blob" && service.eth_blob) {
    const eb = service.eth_blob;
    const fmtBlobCostRender = (v: number) => v < 0.000001 ? v.toExponential(2) : v.toFixed(6);
    const tierColor = eb.fee_tier === "Cheap" ? "#16a34a" : eb.fee_tier === "Moderate" ? "#d97706" : "#dc2626";
    const tierBg = eb.fee_tier === "Cheap" ? "#f0fdf4" : eb.fee_tier === "Moderate" ? "#fffbeb" : "#fef2f2";
    const tierBorder = eb.fee_tier === "Cheap" ? "#86efac" : eb.fee_tier === "Moderate" ? "#fde68a" : "#fecaca";
    const utilFill = `${(eb.utilization_pct).toFixed(0)}%`;
    return (
      <div>
        {/* Summary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ padding: "8px 10px", background: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Blob Base Fee</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#2563eb" }}>{eb.blob_base_fee_gwei.toFixed(4)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>gwei</div>
          </div>
          <div style={{ padding: "8px 10px", background: tierBg, borderRadius: 6, border: `1px solid ${tierBorder}`, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Fee Tier</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: tierColor }}>{eb.fee_tier}</div>
            <div style={{ fontSize: 10, color: "#888" }}>market signal</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>1-Blob Cost</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#111" }}>{fmtBlobCostRender(eb.blob_cost_eth)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>ETH (~128 KB)</div>
          </div>
        </div>

        {/* Blob utilization bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>
            Latest Block Utilization — {eb.blobs_in_latest}/{eb.max_blobs_per_block} blobs ({utilFill})
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {Array.from({ length: eb.max_blobs_per_block }, (_, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 24,
                  borderRadius: 4,
                  background: i < eb.blobs_in_latest ? "#3b82f6" : i < eb.target_blobs_per_block ? "#dbeafe" : "#f3f4f6",
                  border: i < eb.target_blobs_per_block ? "1px solid #93c5fd" : "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 10, color: i < eb.blobs_in_latest ? "#fff" : "#9ca3af", fontWeight: 600 }}>
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: 10, color: "#9ca3af" }}>
            <span>■ <span style={{ color: "#3b82f6" }}>used</span></span>
            <span>■ <span style={{ color: "#93c5fd" }}>target zone (3)</span></span>
            <span>■ <span style={{ color: "#e5e7eb" }}>empty</span></span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, fontSize: 11, color: "#6b7280" }}>
          <span>Block #{eb.block_number.toLocaleString()}</span>
          <span>·</span>
          <span>Target: {eb.target_blobs_per_block} blobs/block</span>
          <span>·</span>
          <span>Max: {eb.max_blobs_per_block} blobs/block</span>
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>EIP-4844 blobspace · Via Ethereum JSON-RPC (publicnode.com)</p>
      </div>
    );
  }

  if (service.service_type === "eth-supply" && service.eth_supply) {
    const es = service.eth_supply;
    const isDefl = es.is_deflationary;
    const statusColor = isDefl ? "#16a34a" : "#dc2626";
    const statusBg = isDefl ? "#f0fdf4" : "#fef2f2";
    const statusBorder = isDefl ? "#86efac" : "#fecaca";
    const netSign = es.net_per_hour >= 0 ? "+" : "";
    const netColor = es.net_per_hour >= 0 ? "#16a34a" : "#dc2626";
    // Supply bar: show burn vs issuance as proportion
    const total = es.burn_per_hour + es.issuance_per_hour;
    const burnPct = total > 0 ? (es.burn_per_hour / total) * 100 : 0;
    return (
      <div>
        {/* Status + key metrics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ padding: "8px 10px", background: statusBg, borderRadius: 6, border: `1px solid ${statusBorder}`, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Status</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: statusColor }}>{isDefl ? "🔥 Deflating" : "📈 Inflating"}</div>
            <div style={{ fontSize: 10, color: "#888" }}>net supply</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fef3c7", borderRadius: 6, border: "1px solid #fde68a", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Burn Rate</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#b45309" }}>{es.burn_per_hour.toFixed(2)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>ETH/hr</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Issuance</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#2563eb" }}>{es.issuance_per_hour.toFixed(2)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>ETH/hr</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "#888" }}>Net/hr</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: netColor }}>{netSign}{es.net_per_hour.toFixed(2)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>ETH/hr</div>
          </div>
        </div>

        {/* Burn vs issuance bar */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6 }}>
            Burn vs Issuance (last {es.blocks_sampled} blocks)
          </div>
          <div style={{ height: 20, borderRadius: 4, background: "#e5e7eb", overflow: "hidden", position: "relative" }}>
            <div style={{ height: "100%", width: `${burnPct.toFixed(1)}%`, background: "#f59e0b", transition: "width 0.5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "#9ca3af" }}>
            <span>■ <span style={{ color: "#f59e0b" }}>burn ({burnPct.toFixed(1)}%)</span></span>
            <span>■ <span style={{ color: "#93c5fd" }}>issuance ({(100 - burnPct).toFixed(1)}%)</span></span>
          </div>
        </div>

        {/* Secondary stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div style={{ padding: "6px 8px", background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 10, color: "#888" }}>Base Fee</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#111" }}>{es.base_fee_gwei.toFixed(3)} gwei</div>
          </div>
          <div style={{ padding: "6px 8px", background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 10, color: "#888" }}>Deflation Threshold</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#111" }}>{es.deflation_threshold_gwei.toFixed(1)} gwei</div>
          </div>
          <div style={{ padding: "6px 8px", background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 10, color: "#888" }}>Supply Change (ann.)</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: netColor }}>{es.supply_change_pct_annual >= 0 ? "+" : ""}{es.supply_change_pct_annual.toFixed(3)}%</div>
          </div>
        </div>

        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>EIP-1559 burn · PoS issuance ~1700 ETH/day · Via Ethereum JSON-RPC (publicnode.com)</p>
      </div>
    );
  }

  if (service.service_type === "dao-governance" && service.dao_governance) {
    const dg = service.dao_governance;
    const now = Math.floor(Date.now() / 1000);
    const fmtEnd = (ts: number) => {
      const diff = ts - now;
      if (diff <= 0) return "ended";
      const days = Math.floor(diff / 86400);
      const hours = Math.floor((diff % 86400) / 3600);
      return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
    };
    return (
      <div>
        {/* Summary header */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{ padding: "8px 14px", background: dg.active_count > 0 ? "#f0fdf4" : "#f9fafb", borderRadius: 6, border: `1px solid ${dg.active_count > 0 ? "#86efac" : "#e5e7eb"}`, textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: dg.active_count > 0 ? "#16a34a" : "#6b7280" }}>{dg.active_count}</div>
            <div style={{ fontSize: 11, color: "#888" }}>Active</div>
          </div>
          <div style={{ padding: "8px 14px", background: "#f9fafb", borderRadius: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#6b7280" }}>{dg.closed_count}</div>
            <div style={{ fontSize: 11, color: "#888" }}>Recent</div>
          </div>
          <div style={{ flex: 1, padding: "8px 12px", background: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe", display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#2563eb", fontWeight: 500 }}>
              {dg.proposals.length > 0 ? `Tracking ${new Set(dg.proposals.map(p => p.dao_id)).size} DAOs` : "No recent activity"}
            </span>
          </div>
        </div>

        {/* Proposals list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {dg.proposals.map((p) => {
            const isActive = p.state === "active";
            const stateBg = isActive ? "#f0fdf4" : "#f9fafb";
            const stateBorder = isActive ? "#86efac" : "#e5e7eb";
            const stateColor = isActive ? "#16a34a" : "#9ca3af";
            return (
              <div key={p.id} style={{ padding: "10px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111", lineHeight: 1.4, flex: 1 }}>
                    {p.title.length > 72 ? p.title.slice(0, 72) + "…" : p.title}
                  </div>
                  <div style={{ padding: "2px 7px", background: stateBg, borderRadius: 4, border: `1px solid ${stateBorder}`, fontSize: 10, fontWeight: 700, color: stateColor, whiteSpace: "nowrap" }}>
                    {isActive ? "ACTIVE" : "CLOSED"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#888" }}>
                  <span style={{ fontWeight: 600, color: "#555" }}>{p.dao_name}</span>
                  <span>·</span>
                  <span>{p.votes.toLocaleString()} votes</span>
                  <span>·</span>
                  <span>{fmtEnd(p.end_timestamp)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: 6, fontSize: 12, color: "#888" }}>Governance activity across major DeFi DAOs · Via Snapshot GraphQL (hub.snapshot.org)</p>
      </div>
    );
  }

  if (service.service_type === "crypto-correlation" && service.crypto_correlation) {
    const cc = service.crypto_correlation;
    const avg = cc.assets.length > 0
      ? (cc.assets.reduce((s, a) => s + a.correlation_30d, 0) / cc.assets.length).toFixed(2)
      : "—";
    const highCount = cc.assets.filter((a) => a.strength === "high").length;
    const negCount = cc.assets.filter((a) => a.strength === "negative").length;

    const strengthColor = (s: string) => {
      if (s === "high") return "#16a34a";
      if (s === "moderate") return "#d97706";
      if (s === "negative") return "#dc2626";
      return "#6b7280";
    };
    const strengthBg = (s: string) => {
      if (s === "high") return "#f0fdf4";
      if (s === "moderate") return "#fffbeb";
      if (s === "negative") return "#fef2f2";
      return "#f9fafb";
    };
    const strengthBorder = (s: string) => {
      if (s === "high") return "#86efac";
      if (s === "moderate") return "#fcd34d";
      if (s === "negative") return "#fca5a5";
      return "#e5e7eb";
    };
    const barWidth = (r: number) => `${Math.round(Math.max(0, Math.min(1, (r + 1) / 2)) * 100)}%`;

    return (
      <div>
        {/* Summary header */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ padding: "8px 14px", background: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe", textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#2563eb" }}>{avg}</div>
            <div style={{ fontSize: 11, color: "#888" }}>Avg ρ vs BTC</div>
          </div>
          <div style={{ padding: "8px 14px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #86efac", textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#16a34a" }}>{highCount}</div>
            <div style={{ fontSize: 11, color: "#888" }}>High Corr.</div>
          </div>
          <div style={{ flex: 1, padding: "8px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb", display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#555" }}>
              BTC ${cc.btc_price_usd.toLocaleString()} · {cc.period_days}-day rolling
              {negCount > 0 && <span style={{ color: "#dc2626", marginLeft: 6 }}>· {negCount} decorrelated</span>}
            </span>
          </div>
        </div>

        {/* Correlation bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
          {cc.assets.map((a) => (
            <div key={a.symbol} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 36, fontSize: 12, fontWeight: 700, color: "#222", textAlign: "right" }}>{a.symbol}</span>
              <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 4, height: 16, overflow: "hidden" }}>
                <div style={{ width: barWidth(a.correlation_30d), background: strengthColor(a.strength), height: "100%", borderRadius: 4 }} />
              </div>
              <span style={{ width: 38, fontSize: 12, fontWeight: 600, color: strengthColor(a.strength), textAlign: "right" }}>
                {a.correlation_30d >= 0 ? "" : "−"}{Math.abs(a.correlation_30d).toFixed(2)}
              </span>
              <span style={{ padding: "1px 6px", background: strengthBg(a.strength), border: `1px solid ${strengthBorder(a.strength)}`, borderRadius: 4, fontSize: 10, fontWeight: 700, color: strengthColor(a.strength), width: 64, textAlign: "center" }}>
                {a.strength.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 6, fontSize: 12, color: "#888" }}>Pearson correlation of daily log returns (30 days) vs BTC · Via CoinGecko market chart API</p>
      </div>
    );
  }

  if (service.service_type === "chain-dev" && service.chain_dev) {
    const cd = service.chain_dev;
    const totalCommits = cd.chains.reduce((s, e) => s + e.commits_4w, 0);

    const activityColor = (level: ChainDevEntry["activity_level"]) => {
      if (level === "high") return "#16a34a";
      if (level === "moderate") return "#d97706";
      return "#6b7280";
    };
    const activityBg = (level: ChainDevEntry["activity_level"]) => {
      if (level === "high") return "#f0fdf4";
      if (level === "moderate") return "#fffbeb";
      return "#f9fafb";
    };
    const activityBorder = (level: ChainDevEntry["activity_level"]) => {
      if (level === "high") return "#86efac";
      if (level === "moderate") return "#fcd34d";
      return "#e5e7eb";
    };
    const trendStr = (pct: number) => {
      if (pct > 5) return `▲ +${pct.toFixed(1)}%`;
      if (pct < -5) return `▼ ${pct.toFixed(1)}%`;
      return `→ ${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
    };
    const trendColor = (pct: number) => (pct >= 5 ? "#16a34a" : pct <= -5 ? "#dc2626" : "#6b7280");
    const barPct = (commits: number) => `${Math.round((commits / Math.max(1, cd.chains[0]?.commits_4w ?? 1)) * 100)}%`;

    return (
      <div>
        {/* Summary header */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <div style={{ padding: "8px 14px", background: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe", textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#2563eb" }}>{totalCommits}</div>
            <div style={{ fontSize: 11, color: "#888" }}>Total Commits/4w</div>
          </div>
          <div style={{ padding: "8px 14px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #86efac", textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#16a34a" }}>{cd.chains.filter((e) => e.activity_level === "high").length}</div>
            <div style={{ fontSize: 11, color: "#888" }}>High Activity</div>
          </div>
          <div style={{ flex: 1, padding: "8px 12px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb", display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#555" }}>
              {cd.chains[0]?.chain ?? "—"} leads · {cd.period_note}
            </span>
          </div>
        </div>

        {/* Per-chain rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
          {cd.chains.map((e) => (
            <div key={e.chain}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ width: 72, fontSize: 12, fontWeight: 700, color: "#222" }}>{e.chain}</span>
                <div style={{ flex: 1, background: "#f3f4f6", borderRadius: 4, height: 14, overflow: "hidden" }}>
                  <div style={{ width: barPct(e.commits_4w), background: activityColor(e.activity_level), height: "100%", borderRadius: 4 }} />
                </div>
                <span style={{ width: 40, fontSize: 12, fontWeight: 600, color: "#222", textAlign: "right" }}>{e.commits_4w}</span>
                <span style={{ width: 70, fontSize: 11, color: trendColor(e.trend_pct), textAlign: "right", fontWeight: 500 }}>{trendStr(e.trend_pct)}</span>
                <span style={{ padding: "1px 6px", background: activityBg(e.activity_level), border: `1px solid ${activityBorder(e.activity_level)}`, borderRadius: 4, fontSize: 10, fontWeight: 700, color: activityColor(e.activity_level), width: 68, textAlign: "center" }}>
                  {e.activity_level.toUpperCase()}
                </span>
              </div>
              <div style={{ marginLeft: 80, fontSize: 10, color: "#aaa" }}>{e.repo} · {e.commits_13w} commits/13w</div>
            </div>
          ))}
        </div>

        <p style={{ marginTop: 6, fontSize: 12, color: "#888" }}>GitHub commit activity for core blockchain repos (4-week window) · Via GitHub stats/participation API</p>
      </div>
    );
  }

  if (service.service_type === "crypto-iv" && service.implied_vol) {
    const iv = service.implied_vol;
    const regimeColor = (r: string) => r === "elevated" ? "#dc2626" : r === "suppressed" ? "#16a34a" : "#888";
    const regimeBg = (r: string) => r === "elevated" ? "#fff5f5" : r === "suppressed" ? "#f0fdf4" : "#fafafa";
    const regimeBorder = (r: string) => r === "elevated" ? "#fca5a5" : r === "suppressed" ? "#86efac" : "#e5e7eb";
    return (
      <div>
        {/* Summary cards */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          {iv.assets.map((a) => (
            <div key={a.symbol} style={{ flex: 1, padding: "10px 14px", background: regimeBg(a.regime), borderRadius: 8, border: `1px solid ${regimeBorder(a.regime)}` }}>
              <div style={{ fontSize: 11, color: "#666", fontWeight: 600, marginBottom: 3 }}>{a.symbol} Implied Vol</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: regimeColor(a.regime), marginBottom: 2 }}>{a.iv_current.toFixed(1)}%</div>
              <div style={{ fontSize: 10, color: regimeColor(a.regime), fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{a.regime}</div>
              <div style={{ fontSize: 11, color: "#555" }}>7d avg: {a.iv_7d_avg.toFixed(1)}%</div>
              <div style={{ fontSize: 11, color: "#555" }}>16d avg: {a.iv_16d_avg.toFixed(1)}%</div>
            </div>
          ))}
        </div>

        {/* Comparison table */}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 12, color: "#888", fontWeight: 600 }}>Asset</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>Current IV</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>7d Avg</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>16d Avg</th>
              <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 12, color: "#888", fontWeight: 600 }}>Regime</th>
            </tr>
          </thead>
          <tbody>
            {iv.assets.map((a) => (
              <tr key={a.symbol} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "7px 8px", fontWeight: 700 }}>{a.symbol}</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700 }}>{a.iv_current.toFixed(1)}%</td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#555" }}>{a.iv_7d_avg.toFixed(1)}%</td>
                <td style={{ padding: "7px 8px", textAlign: "right", color: "#555" }}>{a.iv_16d_avg.toFixed(1)}%</td>
                <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 700, color: regimeColor(a.regime) }}>{a.regime.charAt(0).toUpperCase() + a.regime.slice(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>{iv.note}</p>
      </div>
    );
  }

  if (service.service_type === "ath-distance" && service.ath_distance) {
    const ad = service.ath_distance;
    const pctColor = (v: number) => v >= -20 ? "#16a34a" : v >= -50 ? "#d97706" : v >= -75 ? "#dc2626" : "#7c3aed";
    const changeColor = (v: number) => v >= 0 ? "#16a34a" : "#dc2626";
    const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : n >= 1 ? `$${n.toFixed(2)}` : `$${n.toFixed(4)}`;
    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "5px 8px", textAlign: "left",  fontSize: 11, color: "#888", fontWeight: 600 }}>#</th>
              <th style={{ padding: "5px 8px", textAlign: "left",  fontSize: 11, color: "#888", fontWeight: 600 }}>Coin</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>Price</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>ATH</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>From ATH</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>ATH Date</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>7d</th>
            </tr>
          </thead>
          <tbody>
            {ad.coins.map((c, i) => (
              <tr key={c.symbol} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "6px 8px", color: "#aaa", fontSize: 11 }}>{i + 1}</td>
                <td style={{ padding: "6px 8px", fontWeight: 700 }}>{c.symbol} <span style={{ fontWeight: 400, color: "#888", fontSize: 11 }}>{c.name}</span></td>
                <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(c.current_price)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", color: "#555" }}>{fmt(c.ath)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: pctColor(c.ath_change_pct) }}>{c.ath_change_pct.toFixed(1)}%</td>
                <td style={{ padding: "6px 8px", textAlign: "right", color: "#888", fontSize: 11 }}>{c.ath_date}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", color: changeColor(c.change_7d_pct), fontWeight: 600 }}>{c.change_7d_pct >= 0 ? "+" : ""}{c.change_7d_pct.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>{ad.note}</p>
      </div>
    );
  }

  if (service.service_type === "deriv-overview" && service.deriv_overview) {
    const dov = service.deriv_overview;
    const fmtB = (n: number) => `$${(n / 1e9).toFixed(2)}B`;
    const fundingColor = (v: number) => v > 0.01 ? "#16a34a" : v < -0.005 ? "#dc2626" : "#555";
    return (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "5px 8px", textAlign: "left",  fontSize: 11, color: "#888", fontWeight: 600 }}>Asset</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>Total OI</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>24h Volume</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>Funding (8h)</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>Markets</th>
            </tr>
          </thead>
          <tbody>
            {dov.assets.map((a: DerivAssetStats) => (
              <tr key={a.index} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "6px 8px", fontWeight: 700 }}>{a.index}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{fmtB(a.total_oi_usd)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", color: "#555" }}>{fmtB(a.total_volume_24h)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: fundingColor(a.avg_funding_8h_pct) }}>
                  {a.avg_funding_8h_pct >= 0 ? "+" : ""}{a.avg_funding_8h_pct.toFixed(4)}%
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right", color: "#888", fontSize: 11 }}>{a.market_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>{dov.note}</p>
      </div>
    );
  }

  if (service.service_type === "macro-signals" && service.macro_signals) {
    const ms = service.macro_signals;
    const retColor = (v: number) => v >= 0 ? "#16a34a" : "#dc2626";
    const signalColor = ms.risk_signal === "risk-on" ? "#16a34a" : ms.risk_signal === "risk-off" ? "#dc2626" : "#b45309";
    const signalLabel = ms.risk_signal === "risk-on" ? "Risk-On" : ms.risk_signal === "risk-off" ? "Risk-Off" : "Neutral";
    const fmtPrice = (a: MacroAssetData) => {
      if (a.asset_class === "crypto") return `$${a.current_price.toLocaleString()}`;
      if (a.symbol === "GOLD") return `$${a.current_price.toLocaleString()}`;
      return a.current_price.toLocaleString();
    };
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: "#555" }}>
            BTC–SPX corr: <strong>{ms.btc_spx_correlation_30d >= 0 ? "+" : ""}{ms.btc_spx_correlation_30d.toFixed(2)}</strong>
            {" · "}BTC–Gold corr: <strong>{ms.btc_gold_correlation_30d >= 0 ? "+" : ""}{ms.btc_gold_correlation_30d.toFixed(2)}</strong>
          </span>
          <span style={{ fontSize: 12, fontWeight: 700, color: signalColor, border: `1px solid ${signalColor}`, borderRadius: 4, padding: "2px 7px" }}>
            {signalLabel}
          </span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #e8e8e8" }}>
              <th style={{ padding: "5px 8px", textAlign: "left",  fontSize: 11, color: "#888", fontWeight: 600 }}>Asset</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>Price / Level</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>30d Return</th>
              <th style={{ padding: "5px 8px", textAlign: "right", fontSize: 11, color: "#888", fontWeight: 600 }}>7d Return</th>
            </tr>
          </thead>
          <tbody>
            {ms.assets.map((a: MacroAssetData) => (
              <tr key={a.symbol} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "6px 8px" }}>
                  <span style={{ fontWeight: 700 }}>{a.symbol}</span>
                  <span style={{ fontSize: 11, color: "#888", marginLeft: 6 }}>{a.name}</span>
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{fmtPrice(a)}</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700, color: retColor(a.return_30d_pct) }}>
                  {a.return_30d_pct >= 0 ? "+" : ""}{a.return_30d_pct.toFixed(1)}%
                </td>
                <td style={{ padding: "6px 8px", textAlign: "right", color: retColor(a.return_7d_pct) }}>
                  {a.return_7d_pct >= 0 ? "+" : ""}{a.return_7d_pct.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: 12, color: "#888" }}>{ms.note}</p>
      </div>
    );
  }

  if (service.service_type === "sol-priority-fees" && service.sol_priority_fees) {
    const pf = service.sol_priority_fees;
    const fmt = (n: number) =>
      n >= 1_000_000 ? `${(n / 1_000_000).toFixed(2)}M` :
      n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` :
      n.toString();
    const usd = (n: number) => n < 0.0001 ? "<$0.0001" : `$${n.toFixed(4)}`;
    const congestionColor =
      pf.congestion === "low" ? "#16a34a" :
      pf.congestion === "moderate" ? "#b45309" :
      pf.congestion === "high" ? "#dc2626" :
      "#7c3aed";
    const congestionBg =
      pf.congestion === "low" ? "#f0fdf4" :
      pf.congestion === "moderate" ? "#fffbeb" :
      pf.congestion === "high" ? "#fef2f2" :
      "#f5f3ff";
    const congestionBorder =
      pf.congestion === "low" ? "#86efac" :
      pf.congestion === "moderate" ? "#fcd34d" :
      pf.congestion === "high" ? "#fca5a5" :
      "#c4b5fd";
    return (
      <div>
        {/* Congestion indicator + summary */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ padding: "6px 14px", background: congestionBg, border: `1px solid ${congestionBorder}`, borderRadius: 6, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em" }}>Network Load</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: congestionColor, textTransform: "capitalize" }}>{pf.congestion}</div>
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>
            SOL price <strong>${pf.sol_price_usd.toLocaleString()}</strong> · {pf.slots_sampled} slots sampled
          </div>
        </div>

        {/* Fee metrics grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>Median (P50)</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{fmt(pf.p50_micro_lamports)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>µL/CU</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>75th Pct</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{fmt(pf.p75_micro_lamports)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>µL/CU</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>95th Pct</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{fmt(pf.p95_micro_lamports)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>µL/CU</div>
          </div>
        </div>

        {/* USD cost estimates */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div style={{ padding: "8px 10px", background: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#888" }}>Typical Tx Cost (P50)</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#2563eb" }}>{usd(pf.p50_usd)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>200K CU tx</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fef2f2", borderRadius: 6, border: "1px solid #fca5a5", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#888" }}>High-Priority Tx (P95)</div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#dc2626" }}>{usd(pf.p95_usd)}</div>
            <div style={{ fontSize: 10, color: "#888" }}>200K CU tx</div>
          </div>
        </div>

        <p style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
          Fees in micro-lamports per Compute Unit · Via Solana RPC getRecentPrioritizationFees
        </p>
      </div>
    );
  }

  if (service.service_type === "sui-network" && service.sui_network) {
    const sn = service.sui_network;
    const fmtSui = (n: number) => n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(0)}M` : n.toLocaleString();
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const fmtTx = (n: number) => n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : `${(n / 1e6).toFixed(0)}M`;
    const priceColor = sn.sui_change_24h >= 0 ? "#16a34a" : "#dc2626";
    const sign = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2);
    return (
      <div>
        {/* Price header */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#111" }}>${sn.sui_price_usd.toFixed(3)}</div>
          <div style={{ fontWeight: 600, fontSize: 14, color: priceColor }}>{sign(sn.sui_change_24h)}% 24h</div>
          <div style={{ fontSize: 12, color: "#888", marginLeft: "auto" }}>SUI / USD</div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>DeFi TVL</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>{fmtTvl(sn.defi_tvl_usd)}</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>Total Transactions</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>{fmtTx(sn.total_transactions)}</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>Current Epoch</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>{sn.epoch.toLocaleString()}</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>Active Validators</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>{sn.active_validators}</div>
          </div>
        </div>

        {/* Total staked */}
        <div style={{ padding: "8px 10px", background: "#f0fdf4", borderRadius: 6, border: "1px solid #86efac", marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>Total Staked SUI</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#166534" }}>{fmtSui(sn.total_staked_sui)} SUI</div>
        </div>

        <p style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
          Sui fullnode RPC · CoinGecko · DeFi Llama
        </p>
      </div>
    );
  }

  if (service.service_type === "aptos-network" && service.aptos_network) {
    const an = service.aptos_network;
    const fmtNum = (n: number) => n >= 1e9 ? `${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(0)}M` : n.toLocaleString();
    const fmtTvl = (v: number) => v >= 1e9 ? `$${(v / 1e9).toFixed(2)}B` : `$${(v / 1e6).toFixed(0)}M`;
    const priceColor = an.apt_change_24h >= 0 ? "#16a34a" : "#dc2626";
    const sign = (n: number) => (n >= 0 ? "+" : "") + n.toFixed(2);
    return (
      <div>
        {/* Price header */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: "#111" }}>${an.apt_price_usd.toFixed(3)}</div>
          <div style={{ fontWeight: 600, fontSize: 14, color: priceColor }}>{sign(an.apt_change_24h)}% 24h</div>
          <div style={{ fontSize: 12, color: "#888", marginLeft: "auto" }}>APT / USD</div>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>DeFi TVL</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>{fmtTvl(an.defi_tvl_usd)}</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>Block Height</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>{fmtNum(an.block_height)}</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>Current Epoch</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>{an.epoch.toLocaleString()}</div>
          </div>
          <div style={{ padding: "8px 10px", background: "#fafafa", borderRadius: 6, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>Active Validators</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#111" }}>{an.active_validators}</div>
          </div>
        </div>

        {/* Ledger version */}
        <div style={{ padding: "8px 10px", background: "#f0f9ff", borderRadius: 6, border: "1px solid #7dd3fc", marginBottom: 8 }}>
          <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase" }}>Ledger Version</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#0369a1" }}>{fmtNum(an.ledger_version)}</div>
        </div>

        <p style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
          Aptos mainnet API · CoinGecko · DeFi Llama
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
