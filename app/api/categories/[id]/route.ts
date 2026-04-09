import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateCategory, deleteCategory } from "@/lib/taxonomy";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role ?? "user";
    if (!["admin", "moderator"].includes(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const cat = await updateCategory(id, body);
    if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ category: cat });
  } catch (err: unknown) {
    console.error("[PUT /api/categories/[id]]", err);
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
    const ok = await deleteCategory(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/categories/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
