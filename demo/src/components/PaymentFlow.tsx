"use client";

import { useState, useEffect, useRef } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Transaction } from "@solana/web3.js";

interface InvoiceParams {
  amount: string;
  memo: string;
  startTime: string;
  endTime: string;
}

interface MarketData {
  symbol: string;
  price_usd: number;
  change_24h_pct: number;
}

interface SolanaStats {
  tps: number;
  slot: number;
  validator_count: number;
  epoch: number;
}

interface DefiPool {
  protocol: string;
  symbol: string;
  apy: number;
  tvl_usd: number;
}

interface FearGreedEntry {
  date: string;
  value: number;
  classification: string;
}

interface FearGreedData {
  current_value: number;
  classification: string;
  history: FearGreedEntry[];
}

interface SolanaToken {
  symbol: string;
  name: string;
  price_usd: number;
  change_24h_pct: number;
  market_cap_usd: number;
}

interface SolanaEcosystemData {
  tokens: SolanaToken[];
}

interface AiModel {
  id: string;
  displayName: string;
  downloads: number;
  likes: number;
}

interface AiModelsData {
  models: AiModel[];
}

interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank?: number;
  price_usd: number;
  change_24h_pct: number;
  market_cap?: string;
}

interface TrendingData {
  coins: TrendingCoin[];
}

interface TopGainer {
  symbol: string;
  name: string;
  price_usd: number;
  change_24h_pct: number;
  volume_24h: number;
  market_cap: number;
}

interface TopGainersData {
  gainers: TopGainer[];
}

interface ServiceResult {
  service_type: "crypto-prices" | "solana-stats" | "defi-yields" | "fear-greed" | "solana-ecosystem" | "ai-models" | "trending-coins" | "top-gainers";
  result: string;
  market_data?: MarketData[];
  solana_stats?: SolanaStats;
  defi_pools?: DefiPool[];
  fear_greed?: FearGreedData;
  solana_ecosystem?: SolanaEcosystemData;
  ai_models?: AiModelsData;
  trending?: TrendingData;
  top_gainers?: TopGainersData;
  timestamp: string;
  delivered_to: string;
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

type ServiceType = "crypto-prices" | "solana-stats" | "defi-yields" | "fear-greed" | "solana-ecosystem" | "ai-models" | "trending-coins" | "top-gainers";

const SERVICE_OPTIONS: { id: ServiceType; label: string; description: string; price: string }[] = [
  {
    id: "crypto-prices",
    label: "Crypto Market Prices",
    description: "Live BTC, ETH, and SOL prices with 24h change",
    price: "1 USDC",
  },
  {
    id: "solana-stats",
    label: "Solana Network Stats",
    description: "Current TPS, slot, epoch, and validator count",
    price: "1 USDC",
  },
  {
    id: "defi-yields",
    label: "Solana DeFi Yields",
    description: "Top Solana protocol APY rates by TVL (via DeFi Llama)",
    price: "1 USDC",
  },
  {
    id: "fear-greed",
    label: "Crypto Sentiment",
    description: "Fear & Greed Index (0–100) with 7-day trend history",
    price: "1 USDC",
  },
  {
    id: "solana-ecosystem",
    label: "Solana Ecosystem Tokens",
    description: "Live prices for JUP, RAY, JTO, BONK, WIF, PYTH, ORCA with 24h change",
    price: "1 USDC",
  },
  {
    id: "ai-models",
    label: "Top AI Models",
    description: "Most-liked AI language models on Hugging Face — DeepSeek, Llama, GPT, and more",
    price: "1 USDC",
  },
  {
    id: "trending-coins",
    label: "Trending Coins",
    description: "Top 7 most-searched coins on CoinGecko right now with price and 24h change",
    price: "1 USDC",
  },
  {
    id: "top-gainers",
    label: "Top Gainers",
    description: "Biggest 24h price movers across crypto with >$1M daily volume",
    price: "1 USDC",
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
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {SERVICE_OPTIONS.map((opt) => (
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
