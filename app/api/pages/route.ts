import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listPages, createPage } from "@/lib/pages";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const pages = await listPages();
    return NextResponse.json({ pages });
  } catch (err) {
    console.error("[GET /api/pages]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title_en, title_ne, slug, content_en, content_ne, status } = body;

    if (!title_en?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "Slug must be lowercase letters, numbers, and hyphens" }, { status: 400 });
    }

    const page = await createPage({
      title_en: title_en.trim(), title_ne: (title_ne ?? "").trim(),
      slug: slug.trim(),
      content_en: (content_en ?? "").trim(), content_ne: (content_ne ?? "").trim(),
      status: ["draft", "published", "archived"].includes(status) ? status : "draft",
      author_id: session.user.id,
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/pages]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "A page with that slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
