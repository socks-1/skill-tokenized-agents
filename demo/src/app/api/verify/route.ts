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

type ServiceType = "crypto-prices" | "solana-stats";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userWallet, invoiceParams, signature, serviceType = "crypto-prices" } = body as {
      userWallet: string;
      invoiceParams: InvoiceParams;
      signature: string;
      serviceType?: ServiceType;
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

    // Payment confirmed — deliver the requested service
    const service = await deliverService(userWallet, serviceType);

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

interface MarketData {
  symbol: string;
  price_usd: number;
  change_24h_pct: number;
}

interface SolanaStats {
  tps: number;
  slot: number;
  validator_count: number;
  epoch: number;
}

interface ServiceResult {
  service_type: ServiceType;
  result: string;
  market_data?: MarketData[];
  solana_stats?: SolanaStats;
  timestamp: string;
  delivered_to: string;
}

async function deliverService(userWallet: string, serviceType: ServiceType): Promise<ServiceResult> {
  const timestamp = new Date().toISOString();
  const delivered_to = `${userWallet.slice(0, 8)}...${userWallet.slice(-4)}`;

  if (serviceType === "solana-stats") {
    return deliverSolanaStats(delivered_to, timestamp);
  }
  return deliverCryptoPrices(delivered_to, timestamp);
}

/**
 * Fetches live crypto prices for BTC, ETH, and SOL from CoinGecko.
 */
async function deliverCryptoPrices(delivered_to: string, timestamp: string): Promise<ServiceResult> {
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
    // Fall through with empty market_data
  }

  const result =
    market_data.length > 0
      ? market_data
          .map(
            (m) =>
              `${m.symbol} $${m.price_usd.toLocaleString()} (${m.change_24h_pct >= 0 ? "+" : ""}${m.change_24h_pct}% 24h)`
          )
          .join(" | ")
      : "Market data temporarily unavailable";

  return { service_type: "crypto-prices", result, market_data, timestamp, delivered_to };
}

/**
 * Fetches live Solana network stats via the public RPC.
 */
async function deliverSolanaStats(delivered_to: string, timestamp: string): Promise<ServiceResult> {
  const rpcUrl = process.env.SOLANA_RPC_URL || "https://rpc.solanatracker.io/public";
  let solana_stats: SolanaStats | undefined;

  try {
    // Fetch slot, epoch, and recent performance samples in parallel
    const [slotRes, epochRes, perfRes] = await Promise.all([
      fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot" }),
        signal: AbortSignal.timeout(8000),
      }),
      fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 2, method: "getEpochInfo" }),
        signal: AbortSignal.timeout(8000),
      }),
      fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 3,
          method: "getRecentPerformanceSamples",
          params: [5],
        }),
        signal: AbortSignal.timeout(8000),
      }),
    ]);

    const [slotData, epochData, perfData] = await Promise.all([
      slotRes.json() as Promise<{ result: number }>,
      epochRes.json() as Promise<{ result: { epoch: number; slotIndex: number } }>,
      perfRes.json() as Promise<{ result: Array<{ numTransactions: number; samplePeriodSecs: number }> }>,
    ]);

    const slot: number = slotData.result;
    const epoch: number = epochData.result.epoch;

    // Calculate TPS from recent performance samples
    let tps = 0;
    if (perfData.result && perfData.result.length > 0) {
      const samples = perfData.result;
      const totalTx = samples.reduce((sum, s) => sum + s.numTransactions, 0);
      const totalSecs = samples.reduce((sum, s) => sum + s.samplePeriodSecs, 0);
      tps = totalSecs > 0 ? Math.round(totalTx / totalSecs) : 0;
    }

    // Fetch validator count separately (can be slow — best-effort)
    let validator_count = 0;
    try {
      const voteRes = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 4,
          method: "getVoteAccounts",
          params: [{ commitment: "confirmed" }],
        }),
        signal: AbortSignal.timeout(6000),
      });
      const voteData = (await voteRes.json()) as { result: { current: unknown[] } };
      validator_count = voteData.result?.current?.length ?? 0;
    } catch {
      // validator count is best-effort
    }

    solana_stats = { tps, slot, validator_count, epoch };
  } catch {
    // Fall through with undefined solana_stats
  }

  const result = solana_stats
    ? `TPS: ${solana_stats.tps.toLocaleString()} | Slot: ${solana_stats.slot.toLocaleString()} | Epoch: ${solana_stats.epoch} | Validators: ${solana_stats.validator_count.toLocaleString()}`
    : "Solana network stats temporarily unavailable";

  return { service_type: "solana-stats", result, solana_stats, timestamp, delivered_to };
}
