/**
 * GET /api/x402-data?service=crypto-prices
 *
 * Demonstrates the x402 (HTTP 402 Payment Required) protocol for AI agent micropayments.
 *
 * HOW IT WORKS:
 * 1. Request without payment → HTTP 402 with machine-readable payment requirements
 * 2. Agent reads the 402 body, creates a USDC payment on Base, submits proof
 * 3. Request with X-PAYMENT header → data delivered
 *
 * PRODUCTION SETUP:
 * - Replace RECEIVER_ADDRESS with your Base wallet address
 * - Use x402 facilitator (https://facilitator.x402.org) for real signature verification
 * - Average agent transaction: ~$0.31 USDC (per Circle Q1 2026 data)
 *
 * DEMO/TEST MODE:
 * - Pass X-X402-DEMO: true header to skip payment verification
 * - Facilitator verification is stubbed in demo mode
 *
 * AGENT INTEGRATION EXAMPLE (Python):
 *   import httpx, base64, json
 *   resp = httpx.get("/api/x402-data?service=crypto-prices")
 *   if resp.status_code == 402:
 *       payment_req = resp.json()
 *       # sign + submit USDC payment via Coinbase AgentKit
 *       payment_proof = agent_wallet.pay(payment_req["accepts"][0])
 *       data = httpx.get("/api/x402-data", headers={"X-PAYMENT": payment_proof})
 */
import { NextRequest, NextResponse } from "next/server";
import { deliverService, ALL_SERVICE_TYPES, type ServiceType } from "@/lib/services";

const VALID_SERVICES = ALL_SERVICE_TYPES;

// Base mainnet USDC contract address
const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

// Replace with your actual Base wallet to receive USDC payments in production
const RECEIVER_ADDRESS = process.env.X402_RECEIVER ?? "0x0000000000000000000000000000000000000001";

// Price per request: $0.001 USDC (1000 USDC micro-units at 6 decimals)
const PRICE_MICRO_USDC = "1000";

// x402 compliant HTTP 402 response body
// See: https://www.x402.org/protocol
function buildPaymentRequired(url: string): object {
  return {
    x402Version: 1,
    accepts: [
      {
        scheme: "exact",
        network: "eip155:8453", // Base mainnet
        maxAmountRequired: PRICE_MICRO_USDC,
        resource: url,
        description: "One data query from skill-tokenized-agents API ($0.001 USDC)",
        mimeType: "application/json",
        payTo: RECEIVER_ADDRESS,
        maxTimeoutSeconds: 300,
        asset: USDC_BASE,
        extra: {
          name: "USDC",
          version: "2",
        },
      },
    ],
    error: null,
  };
}

/**
 * Stub verifier for demo mode.
 * In production: POST to https://facilitator.x402.org/verify with the payment header.
 */
async function verifyPaymentHeader(paymentHeader: string, url: string): Promise<boolean> {
  try {
    const decoded = Buffer.from(paymentHeader, "base64").toString("utf8");
    const payment = JSON.parse(decoded) as { payload?: { authorization?: string }; scheme?: string };

    // Minimal structural validation (production would verify EIP-3009 signature on-chain)
    const hasAuthorization = !!payment?.payload?.authorization;
    const isExactScheme = payment?.scheme === "exact";
    return hasAuthorization && isExactScheme;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = req.url;
  const { searchParams } = new URL(url);

  // Demo mode: skip payment verification (for testing and demos)
  const isDemoMode = req.headers.get("X-X402-Demo") === "true";

  // Check for payment header
  const paymentHeader = req.headers.get("X-PAYMENT");

  if (!paymentHeader && !isDemoMode) {
    // Return HTTP 402 with machine-readable payment requirements
    return NextResponse.json(buildPaymentRequired(url), {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        // x402 convention: advertise protocol version
        "X-X402-Version": "1",
      },
    });
  }

  // Verify payment if provided (skip in demo mode)
  if (paymentHeader && !isDemoMode) {
    const valid = await verifyPaymentHeader(paymentHeader, url);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or expired payment. Resubmit payment." },
        { status: 402 }
      );
    }
  }

  // Payment confirmed (or demo mode) — deliver service data
  const raw = searchParams.get("service") ?? "crypto-prices";
  const serviceType: ServiceType = VALID_SERVICES.includes(raw as ServiceType)
    ? (raw as ServiceType)
    : "crypto-prices";

  try {
    const data = await deliverService("x402-agent", serviceType);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
        // x402 convention: include payment response proof
        "X-PAYMENT-RESPONSE": isDemoMode ? "demo-mode-no-payment" : "payment-verified",
        "X-X402-Version": "1",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
