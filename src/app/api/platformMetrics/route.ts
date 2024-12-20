import { calculateRetentionMetricsByPlatform } from "@/services/retentionService";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const metrics = await calculateRetentionMetricsByPlatform();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error calculating retention metrics:", error);
    return NextResponse.json(
      { error: "Failed to calculate retention metrics" },
      { status: 500 }
    );
  }
}
