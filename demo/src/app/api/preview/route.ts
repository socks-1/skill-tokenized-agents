/**
 * GET /api/preview?service=crypto-prices
 *
 * Returns live data for the given service type without requiring payment.
 * This is a free preview endpoint so visitors can see the data quality
 * before committing to a payment.
 *
 * Security: read-only, public data sources, no auth needed.
 */
import { NextRequest, NextResponse } from "next/server";
import { deliverService, type ServiceType } from "@/lib/services";

const VALID_SERVICES: ServiceType[] = ["crypto-prices", "solana-stats", "defi-yields", "fear-greed", "solana-ecosystem", "ai-models"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("service") ?? "crypto-prices";
  const serviceType: ServiceType = VALID_SERVICES.includes(raw as ServiceType)
    ? (raw as ServiceType)
    : "crypto-prices";

  try {
    const data = await deliverService("preview", serviceType);
    return NextResponse.json(data, {
      headers: {
        // Cache briefly so rapid page reloads don't hammer upstream APIs
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
