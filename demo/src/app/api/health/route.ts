/**
 * GET /api/health
 *
 * Returns configuration status. Useful for diagnosing setup issues.
 * Does NOT expose secret values — only reports whether each env var is set.
 */
import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";

const SYSTEM_PROGRAM = "11111111111111111111111111111111";

function isConfigured(value: string | undefined): boolean {
  return Boolean(value && value.trim() !== "" && value !== SYSTEM_PROGRAM);
}

function isValidPublicKey(value: string | undefined): boolean {
  if (!value) return false;
  try {
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const agentMint = process.env.AGENT_TOKEN_MINT_ADDRESS;
  const currencyMint = process.env.CURRENCY_MINT;
  const rpcUrl = process.env.SOLANA_RPC_URL;
  const priceAmount = process.env.PRICE_AMOUNT;

  const agentMintConfigured = isConfigured(agentMint);
  const agentMintValid = isValidPublicKey(agentMint);
  const isSystemProgram = agentMint === SYSTEM_PROGRAM;

  const checks = {
    AGENT_TOKEN_MINT_ADDRESS: {
      set: Boolean(agentMint),
      configured: agentMintConfigured,
      valid: agentMintValid,
      issue: isSystemProgram
        ? "Set to system program — replace with a real pump.fun agent token mint"
        : !agentMint
        ? "Not set"
        : !agentMintValid
        ? "Not a valid Solana public key"
        : null,
    },
    CURRENCY_MINT: {
      set: Boolean(currencyMint),
      configured: Boolean(currencyMint),
      valid: isValidPublicKey(currencyMint),
      issue: !currencyMint
        ? "Not set"
        : !isValidPublicKey(currencyMint)
        ? "Not a valid Solana public key"
        : null,
    },
    SOLANA_RPC_URL: {
      set: Boolean(rpcUrl),
      issue: !rpcUrl ? "Not set" : null,
    },
    PRICE_AMOUNT: {
      set: Boolean(priceAmount),
      valid: Boolean(priceAmount && Number(priceAmount) > 0),
      issue: !priceAmount
        ? "Not set"
        : Number(priceAmount) <= 0
        ? "Must be greater than 0"
        : null,
    },
  };

  const ready =
    agentMintConfigured &&
    agentMintValid &&
    Boolean(currencyMint) &&
    isValidPublicKey(currencyMint) &&
    Boolean(rpcUrl) &&
    Boolean(priceAmount) &&
    Number(priceAmount) > 0;

  const issues = Object.entries(checks)
    .map(([key, val]) => (val.issue ? `${key}: ${val.issue}` : null))
    .filter(Boolean);

  return NextResponse.json({
    ready,
    issues,
    checks,
    hint: ready
      ? "Agent is fully configured and ready to accept payments."
      : "Set the required environment variables in .env.local and restart the dev server.",
  });
}
