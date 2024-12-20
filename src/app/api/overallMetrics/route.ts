import { calculateOverallRetention } from "@/services/retentionService";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const country = url.searchParams.get("country") || undefined;
  const platform = (
    url.searchParams.get("platform") || undefined
  )?.toUpperCase();
  const installDateStart =
    url.searchParams.get("installDateStart") || undefined;
  const installDateEnd = url.searchParams.get("installDateEnd") || undefined;
  try {
    const metrics = await calculateOverallRetention({
      country,
      platform,
      installDateStart,
      installDateEnd,
    });
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error calculating overall retention metrics:", error);
    return NextResponse.json(
      { error: "Failed to calculate overall retention metrics" },
      { status: 500 }
    );
  }
}
