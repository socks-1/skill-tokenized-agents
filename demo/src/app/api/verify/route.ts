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

/**
 * Delivers a premium crypto market summary.
 * Fetches live prices for SOL, BTC, and ETH from CoinGecko.
 * Only called after server-side payment verification passes.
 */
async function deliverService(userWallet: string): Promise<ServiceResult> {
  const url =
    "https://api.coingecko.com/api/v3/simple/price" +
    "?ids=solana,bitcoin,ethereum" +
    "&vs_currencies=usd" +
    "&include_24hr_change=true";

  let market_data: MarketData[] = [];

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = (await res.json()) as Record<
        string,
        { usd: number; usd_24h_change: number }
      >;

      const mapping: Record<string, string> = {
        bitcoin: "BTC",
        ethereum: "ETH",
        solana: "SOL",
      };

      market_data = Object.entries(mapping)
        .filter(([id]) => data[id])
        .map(([id, symbol]) => ({
          symbol,
          price_usd: data[id].usd,
          change_24h_pct: parseFloat(data[id].usd_24h_change.toFixed(2)),
        }));
    }
  } catch {
    // Fall through with empty market_data — still deliver the service
  }

  const summary =
    market_data.length > 0
      ? market_data
          .map(
            (m) =>
              `${m.symbol} $${m.price_usd.toLocaleString()} (${m.change_24h_pct >= 0 ? "+" : ""}${m.change_24h_pct}% 24h)`
          )
          .join(" | ")
      : "Market data temporarily unavailable";

  return {
    result: summary,
    market_data,
    timestamp: new Date().toISOString(),
    delivered_to: `${userWallet.slice(0, 8)}...${userWallet.slice(-4)}`,
  };
}
