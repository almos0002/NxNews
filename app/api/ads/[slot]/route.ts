import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { updateAd } from "@/lib/cms/ads";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slot: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role ?? "user";
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { slot } = await params;
    const body = await req.json();

    const ad = await updateAd(slot, {
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : undefined,
      code:    body.code    !== undefined ? String(body.code)    : undefined,
    });

    if (!ad) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    return NextResponse.json({ ad });
  } catch (err: unknown) {
    console.error("[PUT /api/ads/[slot]]", err);
    return NextResponse.json({ error: "Failed to update ad" }, { status: 500 });
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
