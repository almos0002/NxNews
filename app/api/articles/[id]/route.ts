import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getArticleById, updateArticle, deleteArticle } from "@/lib/content/articles";
import { revalidateArticleSurfaces } from "@/lib/content/revalidation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const article = await getArticleById(id);
    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ article });
  } catch (err) {
    console.error("[GET /api/articles/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const existing = await getArticleById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const role = (session.user as { role?: string }).role ?? "user";
    if (role === "author" && existing.author_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title_en, title_ne, slug, excerpt_en, excerpt_ne,
            content_en, content_ne, category, tags, status, featured_image } = body;

    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
    }

    const updated = await updateArticle(id, {
      ...(title_en !== undefined && { title_en: title_en.trim() }),
      ...(title_ne !== undefined && { title_ne: title_ne.trim() }),
      ...(slug !== undefined && { slug: slug.trim() }),
      ...(excerpt_en !== undefined && { excerpt_en: excerpt_en.trim() }),
      ...(excerpt_ne !== undefined && { excerpt_ne: excerpt_ne.trim() }),
      ...(content_en !== undefined && { content_en: content_en.trim() }),
      ...(content_ne !== undefined && { content_ne: content_ne.trim() }),
      ...(category !== undefined && { category }),
      ...(tags !== undefined && { tags: Array.isArray(tags) ? tags : [] }),
      ...(status !== undefined && { status }),
      ...(featured_image !== undefined && { featured_image: featured_image.trim() }),
    });

    if (updated) {
      await revalidateArticleSurfaces({
        slugs: Array.from(new Set([existing.slug, updated.slug])),
        categories: Array.from(new Set([existing.category, updated.category])),
        tags: Array.from(new Set([
          ...(Array.isArray(existing.tags) ? existing.tags : []),
          ...(Array.isArray(updated.tags) ? updated.tags : []),
        ])),
      });
    }

    return NextResponse.json({ article: updated });
  } catch (err: unknown) {
    console.error("[PUT /api/articles/[id]]", err);
    const msg = err instanceof Error ? err.message : "Server error";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return NextResponse.json({ error: "Slug already in use by another article" }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const existing = await getArticleById(id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const role = (session.user as { role?: string }).role ?? "user";
    if (role === "author" && existing.author_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deleted = await deleteArticle(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await revalidateArticleSurfaces({
      slugs: [existing.slug],
      categories: [existing.category],
      tags: Array.isArray(existing.tags) ? existing.tags : [],
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/articles/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
