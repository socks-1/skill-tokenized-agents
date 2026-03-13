/**
 * POST /api/verify
 * Body: { userWallet: string, invoiceParams: InvoiceParams, signature: string }
 *
 * Verifies the payment on-chain and delivers the service if confirmed.
 * Always verify server-side — never trust the client alone.
 */
import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/pump-agent";
import type { InvoiceParams } from "@/lib/pump-agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userWallet, invoiceParams, signature } = body as {
      userWallet: string;
      invoiceParams: InvoiceParams;
      signature: string;
    };

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

    // Payment confirmed — deliver the service
    const serviceResult = await deliverService(userWallet);

    return NextResponse.json({
      paid: true,
      signature,
      service: serviceResult,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Replace this stub with your actual service delivery logic.
 * Only called after server-side payment verification passes.
 */
async function deliverService(userWallet: string): Promise<{ result: string }> {
  return {
    result: `Service delivered to ${userWallet.slice(0, 8)}...${userWallet.slice(-4)} at ${new Date().toISOString()}`,
  };
}
