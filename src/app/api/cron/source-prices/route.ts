import { NextResponse } from "next/server";
import { syncSourcePrices } from "@/lib/integrations/source-prices";

export const maxDuration = 120;

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await syncSourcePrices({
    archiveUnavailable: process.env.SOURCE_SYNC_ARCHIVE_UNAVAILABLE === "true" || process.env.MIDEA_SYNC_ARCHIVE_UNAVAILABLE === "true",
  });
  return NextResponse.json(result);
}
