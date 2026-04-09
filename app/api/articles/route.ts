import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listArticles, createArticle, countByStatus } from "@/lib/articles";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const status = searchParams.get("status") ?? "all";
    const search = searchParams.get("search") ?? undefined;
    const category = searchParams.get("category") ?? undefined;
    const limit = parseInt(searchParams.get("limit") ?? "50", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const [articles, counts] = await Promise.all([
      listArticles({ status, search, category, limit, offset }),
      countByStatus(),
    ]);

    return NextResponse.json({ articles, counts });
  } catch (err) {
    console.error("[GET /api/articles]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title_en, title_ne, slug, excerpt_en, excerpt_ne,
            content_en, content_ne, category, tags, status, featured_image } = body;

    if (!title_en?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: "English title and slug are required" }, { status: 400 });
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "Slug must be lowercase letters, numbers, and hyphens only" }, { status: 400 });
    }

    const article = await createArticle({
      title_en: title_en.trim(),
      title_ne: (title_ne ?? "").trim(),
      slug: slug.trim(),
      excerpt_en: (excerpt_en ?? "").trim(),
      excerpt_ne: (excerpt_ne ?? "").trim(),
      content_en: (content_en ?? "").trim(),
      content_ne: (content_ne ?? "").trim(),
      category: category ?? "",
      tags: Array.isArray(tags) ? tags : [],
      status: ["draft", "published", "archived"].includes(status) ? status : "draft",
      featured_image: (featured_image ?? "").trim(),
      author_id: session.user.id,
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/articles]", err);
    const msg = err instanceof Error ? err.message : "Server error";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "A slug with that name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
