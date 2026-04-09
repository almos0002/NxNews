import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateTag, deleteTag } from "@/lib/taxonomy";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role ?? "user";
    if (!["admin", "moderator"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const tag = await updateTag(id, body);
    if (!tag) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ tag });
  } catch (err: unknown) {
    console.error("[PUT /api/tags/[id]]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role ?? "user";
    if (!["admin", "moderator"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const ok = await deleteTag(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/tags/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
