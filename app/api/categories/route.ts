import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listCategories, createCategory } from "@/lib/taxonomy";

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/--+/g, "-").slice(0, 60);
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const categories = await listCategories();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("[GET /api/categories]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as { role?: string }).role ?? "user";
    if (!["admin", "moderator"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name_en, name_ne } = body;
    if (!name_en?.trim()) return NextResponse.json({ error: "English name is required" }, { status: 400 });

    const slug = body.slug?.trim() || toSlug(name_en);
    const category = await createCategory({
      name_en: name_en.trim(), name_ne: (name_ne ?? "").trim(), slug,
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/categories]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "A category with that slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
