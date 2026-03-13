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

type PaymentState =
  | { status: "idle" }
  | { status: "building" }
  | { status: "signing" }
  | { status: "confirming" }
  | { status: "verifying" }
  | { status: "success"; result: string; signature: string }
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

      const { service } = await verifyRes.json();
      setState({ status: "success", result: service.result, signature });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const statusLabel: Record<string, string> = {
    idle: "Pay Now",
    building: "Building transaction...",
    signing: "Sign in wallet...",
    confirming: "Confirming on-chain...",
    verifying: "Verifying payment...",
  };

  const isLoading = ["building", "signing", "confirming", "verifying"].includes(
    state.status
  );

  return (
    <div style={{ maxWidth: 480, margin: "60px auto", fontFamily: "sans-serif", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Pump Tokenized Agent Demo</h1>
      <p style={{ color: "#555", marginBottom: 32 }}>
        Connect your wallet to pay for access to this agent&apos;s service.
      </p>

      <div style={{ marginBottom: 24 }}>
        <WalletMultiButton />
      </div>

      {connected && (
        <div>
          <p style={{ fontSize: 14, color: "#666", marginBottom: 16 }}>
            Wallet: {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-4)}
          </p>

          <button
            onClick={handlePay}
            disabled={isLoading || state.status === "success"}
            style={{
              padding: "12px 24px",
              background: isLoading ? "#aaa" : "#0052cc",
              color: "white",
              border: "none",
              borderRadius: 6,
              fontSize: 16,
              cursor: isLoading ? "not-allowed" : "pointer",
              width: "100%",
            }}
          >
            {isLoading
              ? statusLabel[state.status] || "Processing..."
              : state.status === "success"
              ? "Paid!"
              : "Pay Now"}
          </button>

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
            <div style={{ marginTop: 16, padding: 12, background: "#f0fff4", borderRadius: 6, color: "#006622" }}>
              <strong>Payment confirmed!</strong>
              <p style={{ marginTop: 8, fontSize: 14 }}>{state.result}</p>
              <p style={{ fontSize: 12, color: "#555", wordBreak: "break-all" }}>
                Signature: {state.signature}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
