"use client";

import { useState } from "react";
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

interface ServiceResult {
  result: string;
  market_data: MarketData[];
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

/**
 * Signs a base64-encoded unsigned transaction and submits it.
 * Returns the signature without waiting for on-chain confirmation.
 * Extracted from component so it doesn't call hooks in async context.
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

  const handlePay = async () => {
    if (!publicKey || !signTransaction) return;

    try {
      // Step 1: Request invoice + unsigned transaction from server
      setState({ status: "building" });
      const invoiceRes = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userWallet: publicKey.toBase58() }),
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

  const statusLabel: Record<string, string> = {
    idle: "Pay 1 USDC for Market Data",
    building: "Building transaction...",
    signing: "Sign in wallet...",
    confirming: "Confirming on-chain...",
    verifying: "Verifying payment...",
  };

  const isLoading = ["building", "signing", "confirming", "verifying"].includes(
    state.status
  );

  return (
    <div style={{ maxWidth: 520, margin: "60px auto", fontFamily: "system-ui, sans-serif", padding: "0 16px" }}>
      <h1 style={{ fontSize: 26, marginBottom: 6, fontWeight: 700 }}>
        Pump Tokenized Agent Demo
      </h1>
      <p style={{ color: "#555", marginBottom: 8, fontSize: 15 }}>
        This agent delivers live crypto market data after payment is verified on-chain.
      </p>
      <div style={{ background: "#f5f5f5", borderRadius: 8, padding: "10px 14px", marginBottom: 28, fontSize: 13, color: "#444" }}>
        <strong>Service:</strong> Real-time prices for BTC, ETH, and SOL
        &nbsp;|&nbsp; <strong>Price:</strong> 1 USDC
        &nbsp;|&nbsp; <strong>Network:</strong> Solana Mainnet
      </div>

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
            disabled={isLoading || state.status === "success"}
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
              : statusLabel.idle}
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

          {state.status === "success" && (
            <div style={{ marginTop: 16, borderRadius: 8, overflow: "hidden", border: "1px solid #c3e6cb" }}>
              <div style={{ background: "#d4edda", padding: "10px 14px", color: "#155724", fontWeight: 600, fontSize: 14 }}>
                Payment verified — market data delivered
              </div>
              <div style={{ background: "#f9fffe", padding: 14 }}>
                {state.service.market_data.length > 0 ? (
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
                ) : (
                  <p style={{ color: "#555", fontSize: 14 }}>{state.service.result}</p>
                )}
                <p style={{ fontSize: 11, color: "#aaa", marginTop: 10, marginBottom: 0 }}>
                  Delivered to {state.service.delivered_to} &middot; {new Date(state.service.timestamp).toLocaleTimeString()}
                </p>
                <p style={{ fontSize: 11, color: "#bbb", wordBreak: "break-all", marginTop: 4, marginBottom: 0 }}>
                  Tx: {state.signature}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
