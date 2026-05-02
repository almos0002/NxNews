import { NextResponse } from "next/server";
import { getAllAds } from "@/lib/cms/ads";

export async function GET() {
  try {
    const ads = await getAllAds();
    return NextResponse.json({ ads });
  } catch (err: unknown) {
    console.error("[GET /api/ads]", err);
    return NextResponse.json({ error: "Failed to load ads" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
