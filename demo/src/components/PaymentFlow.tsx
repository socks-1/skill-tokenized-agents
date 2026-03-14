"use client";

import { useState, useEffect } from "react";
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

interface ServiceResult {
  service_type: "crypto-prices" | "solana-stats" | "defi-yields";
  result: string;
  market_data?: MarketData[];
  solana_stats?: SolanaStats;
  defi_pools?: DefiPool[];
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

interface HealthStatus {
  ready: boolean;
  issues: string[];
}

type ServiceType = "crypto-prices" | "solana-stats" | "defi-yields";

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
];

/** Mock market data used in the demo tour and as a fallback. */
const MOCK_MARKET_DATA: MarketData[] = [
  { symbol: "BTC", price_usd: 83241, change_24h_pct: 2.14 },
  { symbol: "ETH", price_usd: 1972, change_24h_pct: -0.87 },
  { symbol: "SOL", price_usd: 132.5, change_24h_pct: 3.41 },
];

const MOCK_SOLANA_STATS: SolanaStats = {
  tps: 3847,
  slot: 318_204_512,
  validator_count: 1847,
  epoch: 741,
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

function CodePanel({ status }: { status: string }) {
  const snippet = CODE_SNIPPETS[status] ?? CODE_SNIPPETS.idle;
  return (
    <div style={{ marginTop: 12, borderRadius: 6, overflow: "hidden", fontSize: 12, border: "1px solid #1e2a3a" }}>
      <div style={{
        background: "#1e2a3a",
        padding: "6px 12px",
        color: "#7eb8f7",
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: "0.02em",
      }}>
        {snippet.title}
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

function buildTourSteps(serviceType: ServiceType): PaymentState[] {
  let mockService: ServiceResult;
  if (serviceType === "solana-stats") {
    mockService = {
      service_type: "solana-stats",
      result: "TPS: 3,847 | Slot: 318,204,512 | Epoch: 741 | Validators: 1,847",
      solana_stats: MOCK_SOLANA_STATS,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else if (serviceType === "defi-yields") {
    mockService = {
      service_type: "defi-yields",
      result: "jito-liquid-staking JITOSOL 5.94% APY | marinade-liquid-staking MSOL 7.07% APY | drift-staked-sol DSOL 6.50% APY",
      defi_pools: MOCK_DEFI_POOLS,
      timestamp: new Date().toISOString(),
      delivered_to: "Demo1234...abcd",
    };
  } else {
    mockService = {
      service_type: "crypto-prices",
      result: "BTC $83,241 (+2.14% 24h) | ETH $1,972 (-0.87% 24h) | SOL $132.5 (+3.41% 24h)",
      market_data: MOCK_MARKET_DATA,
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

export default function PaymentFlow() {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [state, setState] = useState<PaymentState>({ status: "idle" });
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [tourStep, setTourStep] = useState<number>(-1);
  const [isTourRunning, setIsTourRunning] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>("crypto-prices");
  const [showCode, setShowCode] = useState(false);

  // Fetch health status on mount
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data: HealthStatus) => setHealth(data))
      .catch(() => setHealth(null));
  }, []);

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

  /** Runs an animated tour of the payment flow states with mock data. */
  const runTour = async () => {
    if (isTourRunning) return;
    const tourSteps = buildTourSteps(selectedService);
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
            {state.service.service_type === "crypto-prices" && state.service.market_data && state.service.market_data.length > 0 ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #eee" }}>
                    <th style={{ textAlign: "left", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Asset</th>
                    <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>Price (USD)</th>
                    <th style={{ textAlign: "right", padding: "4px 8px", color: "#777", fontWeight: 500, fontSize: 12 }}>24h</th>
                  </tr>
                </thead>
                <tbody>
                  {state.service.market_data.map((m) => (
                    <tr key={m.symbol} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 8px", fontWeight: 700 }}>{m.symbol}</td>
                      <td style={{ padding: "8px 8px", textAlign: "right" }}>
                        ${m.price_usd.toLocaleString()}
                      </td>
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
            ) : state.service.service_type === "solana-stats" && state.service.solana_stats ? (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15 }}>
                <tbody>
                  {[
                    { label: "Transactions / sec (TPS)", value: state.service.solana_stats.tps.toLocaleString() },
                    { label: "Current Slot", value: state.service.solana_stats.slot.toLocaleString() },
                    { label: "Current Epoch", value: state.service.solana_stats.epoch.toLocaleString() },
                    { label: "Active Validators", value: state.service.solana_stats.validator_count.toLocaleString() },
                  ].map(({ label, value }) => (
                    <tr key={label} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "8px 8px", color: "#666", fontSize: 13 }}>{label}</td>
                      <td style={{ padding: "8px 8px", textAlign: "right", fontWeight: 700 }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : state.service.service_type === "defi-yields" && state.service.defi_pools && state.service.defi_pools.length > 0 ? (
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
                  {state.service.defi_pools.map((p) => (
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
            ) : (
              <p style={{ color: "#555", fontSize: 14 }}>{state.service.result}</p>
            )}
            <p style={{ fontSize: 11, color: "#aaa", marginTop: 10, marginBottom: 0 }}>
              Delivered to {state.service.delivered_to} &middot; {new Date(state.service.timestamp).toLocaleTimeString()}
            </p>
            {state.signature !== MOCK_SIGNATURE && (
              <p style={{ fontSize: 11, color: "#bbb", wordBreak: "break-all", marginTop: 4, marginBottom: 0 }}>
                Tx: {state.signature}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
