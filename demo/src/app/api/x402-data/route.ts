/**
 * GET /api/x402-data?service=crypto-prices
 *
 * Implements the x402 (HTTP 402 Payment Required) protocol for AI agent micropayments.
 *
 * HOW IT WORKS:
 * 1. Request without payment → HTTP 402 with machine-readable payment requirements
 * 2. Agent reads the 402 body, creates a USDC payment on Base Sepolia, submits proof
 * 3. Request with X-PAYMENT header → verified against x402.org/facilitator → data delivered
 *
 * NETWORK: Base Sepolia (eip155:84532) — testnet USDC
 * FACILITATOR: https://x402.org/facilitator (Coinbase-hosted)
 * RECEIVER: 0xB7555297d48C60A6f932Fe6404ecF8b20BD3f1AB
 * PRICE: $0.001 USDC per request
 *
 * AGENT INTEGRATION EXAMPLE (Python):
 *   import httpx, base64, json
 *   resp = httpx.get("/api/x402-data?service=crypto-prices")
 *   if resp.status_code == 402:
 *       payment_req = resp.json()
 *       # sign USDC payment via Coinbase AgentKit or viem wallet
 *       proof = agent_wallet.pay(payment_req["accepts"][0])
 *       data = httpx.get("/api/x402-data", headers={"X-PAYMENT": proof})
 *
 * DEMO/TEST MODE:
 *   Add header X-X402-Demo: true to skip payment verification (for testing only).
 */
import { NextRequest, NextResponse } from "next/server";
import { deliverService, ALL_SERVICE_TYPES, type ServiceType } from "@/lib/services";

const VALID_SERVICES = ALL_SERVICE_TYPES;

// Base Sepolia USDC contract address (testnet)
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

// Receiver address on Base Sepolia
const RECEIVER_ADDRESS =
  process.env.X402_RECEIVER ?? "0xB7555297d48C60A6f932Fe6404ecF8b20BD3f1AB";

// Price per request: $0.001 USDC (1000 USDC micro-units at 6 decimals)
const PRICE_MICRO_USDC = "1000";

// x402 v2 payment requirements (returned with 402)
function buildPaymentRequired(url: string): object {
  return {
    x402Version: 2,
    accepts: [
      {
        scheme: "exact",
        network: "eip155:84532", // Base Sepolia
        maxAmountRequired: PRICE_MICRO_USDC,
        resource: url,
        description: "One data query from skill-tokenized-agents ($0.001 USDC on Base Sepolia)",
        mimeType: "application/json",
        payTo: RECEIVER_ADDRESS,
        maxTimeoutSeconds: 300,
        asset: USDC_BASE_SEPOLIA,
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
 * Verify payment header against the x402.org hosted facilitator.
 * The facilitator checks the EIP-3009 signature and validates the payment.
 */
async function verifyPaymentWithFacilitator(
  paymentHeader: string,
  paymentRequirements: object
): Promise<{ valid: boolean; reason?: string }> {
  try {
    const decoded = Buffer.from(paymentHeader, "base64").toString("utf8");
    const paymentPayload = JSON.parse(decoded) as { x402Version?: number };

    const response = await fetch("https://x402.org/facilitator/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        x402Version: paymentPayload.x402Version ?? 2,
        paymentPayload,
        paymentRequirements,
      }),
    });

    const result = (await response.json()) as {
      isValid?: boolean;
      invalidReason?: string;
      invalidMessage?: string;
    };

    if (result.isValid === true) {
      return { valid: true };
    }
    return {
      valid: false,
      reason: result.invalidReason ?? result.invalidMessage ?? "invalid_payment",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "verification_error";
    return { valid: false, reason: message };
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
        "X-X402-Version": "2",
      },
    });
  }

  // Verify payment against hosted facilitator (skip in demo mode)
  if (paymentHeader && !isDemoMode) {
    const paymentRequirements = buildPaymentRequired(url);
    const { valid, reason } = await verifyPaymentWithFacilitator(
      paymentHeader,
      paymentRequirements
    );

    if (!valid) {
      return NextResponse.json(
        {
          error: "Invalid or rejected payment.",
          reason,
          hint: "Ensure payment is on eip155:84532 (Base Sepolia) with USDC at 0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        },
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
        "X-PAYMENT-RESPONSE": isDemoMode ? "demo-mode-no-payment" : "payment-verified",
        "X-X402-Version": "2",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
