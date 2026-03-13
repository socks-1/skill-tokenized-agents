/**
 * POST /api/invoice
 * Body: { userWallet: string }
 *
 * Generates invoice params and returns an unsigned base64-serialized transaction
 * for the client to sign and submit on-chain.
 */
import { NextRequest, NextResponse } from "next/server";
import { generateInvoiceParams, buildPaymentTransaction } from "@/lib/pump-agent";

export async function POST(req: NextRequest) {
  try {
    const { userWallet } = await req.json();

    if (!userWallet || typeof userWallet !== "string") {
      return NextResponse.json(
        { error: "userWallet is required" },
        { status: 400 }
      );
    }

    const invoiceParams = generateInvoiceParams();

    if (Number(invoiceParams.amount) <= 0) {
      return NextResponse.json(
        { error: "Invalid price amount configured" },
        { status: 500 }
      );
    }

    const { transaction } = await buildPaymentTransaction({
      userWallet,
      invoiceParams,
    });

    return NextResponse.json({ transaction, invoiceParams });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
