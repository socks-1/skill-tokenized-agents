/**
 * POST /api/verify
 * Body: { userWallet: string, invoiceParams: InvoiceParams, signature: string, serviceType?: string }
 *
 * Verifies the payment on-chain and delivers the requested service if confirmed.
 * Always verify server-side — never trust the client alone.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/pump-agent";
import type { InvoiceParams } from "@/lib/pump-agent";
import { deliverService, type ServiceType } from "@/lib/services";

const VALID_SERVICES: ServiceType[] = ["crypto-prices", "solana-stats", "defi-yields", "fear-greed", "solana-ecosystem", "ai-models", "trending-coins"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userWallet, invoiceParams, signature, serviceType = "crypto-prices" } = body as {
      userWallet: string;
      invoiceParams: InvoiceParams;
      signature: string;
      serviceType?: ServiceType;
    };

    const resolvedService: ServiceType = VALID_SERVICES.includes(serviceType) ? serviceType : "crypto-prices";

    if (!userWallet || !invoiceParams || !signature) {
      return NextResponse.json(
        { error: "userWallet, invoiceParams, and signature are required" },
        { status: 400 }
      );
    }

    const paid = await verifyPayment({ userWallet, invoiceParams });

    if (!paid) {
      return NextResponse.json(
        { paid: false, message: "Payment not confirmed. Please retry." },
        { status: 402 }
      );
    }

    // Payment confirmed — deliver the requested service
    const service = await deliverService(
      `${userWallet.slice(0, 8)}...${userWallet.slice(-4)}`,
      resolvedService
    );

    return NextResponse.json({
      paid: true,
      signature,
      service,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
