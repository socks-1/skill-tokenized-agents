/**
 * Server-side PumpAgent utilities.
 * Import only in API routes (not client components).
 */
import { Connection, PublicKey, Transaction, ComputeBudgetProgram } from "@solana/web3.js";
import { PumpAgent } from "@pump-fun/agent-payments-sdk";

export interface InvoiceParams {
  amount: string;
  memo: string;
  startTime: string;
  endTime: string;
}

/** Generate a fresh set of invoice parameters. */
export function generateInvoiceParams(): InvoiceParams {
  const memo = String(Math.floor(Math.random() * 900_000_000_000) + 100_000);
  const now = Math.floor(Date.now() / 1000);
  return {
    amount: process.env.PRICE_AMOUNT || "1000000",
    memo,
    startTime: String(now),
    endTime: String(now + 86400), // valid for 24 hours
  };
}

/**
 * Build a payment transaction for the given user wallet.
 * Returns the unsigned transaction serialized as base64, plus the invoice params
 * so the server can verify later.
 */
export async function buildPaymentTransaction(params: {
  userWallet: string;
  invoiceParams: InvoiceParams;
}): Promise<{ transaction: string; invoiceParams: InvoiceParams }> {
  const rpcUrl = process.env.SOLANA_RPC_URL;
  const agentMintStr = process.env.AGENT_TOKEN_MINT_ADDRESS;
  const currencyMintStr = process.env.CURRENCY_MINT;

  if (!rpcUrl || !agentMintStr || !currencyMintStr) {
    throw new Error(
      "Missing required environment variables: SOLANA_RPC_URL, AGENT_TOKEN_MINT_ADDRESS, CURRENCY_MINT"
    );
  }

  const SYSTEM_PROGRAM = "11111111111111111111111111111111";
  if (agentMintStr === SYSTEM_PROGRAM) {
    throw new Error(
      "AGENT_TOKEN_MINT_ADDRESS is set to the system program. " +
        "Replace it with your pump.fun agent token mint address in .env.local."
    );
  }

  const connection = new Connection(rpcUrl, "confirmed");
  const agentMint = new PublicKey(agentMintStr);
  const currencyMint = new PublicKey(currencyMintStr);
  const userPublicKey = new PublicKey(params.userWallet);

  const agent = new PumpAgent(agentMint, "mainnet", connection);

  const instructions = await agent.buildAcceptPaymentInstructions({
    user: userPublicKey,
    currencyMint,
    amount: params.invoiceParams.amount,
    memo: params.invoiceParams.memo,
    startTime: params.invoiceParams.startTime,
    endTime: params.invoiceParams.endTime,
  });

  const { blockhash } = await connection.getLatestBlockhash("confirmed");

  const tx = new Transaction();
  tx.recentBlockhash = blockhash;
  tx.feePayer = userPublicKey;
  // Add priority fee for faster landing + SDK-provided instructions
  tx.add(
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100_000 }),
    ...instructions
  );

  const serializedTx = tx
    .serialize({ requireAllSignatures: false })
    .toString("base64");

  return { transaction: serializedTx, invoiceParams: params.invoiceParams };
}

/**
 * Verify that a specific invoice has been paid on-chain.
 * Always call this server-side before delivering any service.
 */
export async function verifyPayment(params: {
  userWallet: string;
  invoiceParams: InvoiceParams;
}): Promise<boolean> {
  const agentMintStr = process.env.AGENT_TOKEN_MINT_ADDRESS;
  const currencyMintStr = process.env.CURRENCY_MINT;

  if (!agentMintStr || !currencyMintStr) {
    throw new Error(
      "Missing required environment variables: AGENT_TOKEN_MINT_ADDRESS, CURRENCY_MINT"
    );
  }

  const SYSTEM_PROGRAM = "11111111111111111111111111111111";
  if (agentMintStr === SYSTEM_PROGRAM) {
    throw new Error(
      "AGENT_TOKEN_MINT_ADDRESS is set to the system program. " +
        "Replace it with your pump.fun agent token mint address in .env.local."
    );
  }

  const rpcUrl = process.env.SOLANA_RPC_URL;
  const agentMint = new PublicKey(agentMintStr);
  // Pass a connection so the SDK can fall back to on-chain scanning
  // when its HTTP API returns no result (e.g. fresh transactions).
  const connection = rpcUrl ? new Connection(rpcUrl, "confirmed") : undefined;
  const agent = connection
    ? new PumpAgent(agentMint, "mainnet", connection)
    : new PumpAgent(agentMint);

  const invoiceParamsNumeric = {
    user: new PublicKey(params.userWallet),
    currencyMint: new PublicKey(currencyMintStr),
    amount: Number(params.invoiceParams.amount),
    memo: Number(params.invoiceParams.memo),
    startTime: Number(params.invoiceParams.startTime),
    endTime: Number(params.invoiceParams.endTime),
  };

  // Retry up to 10 times — on-chain confirmation may take a few seconds
  for (let attempt = 0; attempt < 10; attempt++) {
    const verified = await agent.validateInvoicePayment(invoiceParamsNumeric);
    if (verified) return true;
    if (attempt < 9) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  return false;
}
