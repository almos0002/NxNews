import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { reorderMenuItems } from "@/lib/cms/menu";

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role ?? "user";
    if (!["admin", "moderator"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { items } = body;
    if (!Array.isArray(items)) return NextResponse.json({ error: "items array required" }, { status: 400 });

    await reorderMenuItems(items);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/menu/reorder]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
