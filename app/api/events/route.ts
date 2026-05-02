import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { listEventPhotos, countEventPhotos, createEventPhoto, toEventSlug } from "@/lib/cms/events";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") ?? "all") as "published" | "draft" | "all";
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const [events, total] = await Promise.all([
      listEventPhotos({ limit, offset, status }),
      countEventPhotos({ status }),
    ]);
    return NextResponse.json({ events, total });
  } catch (err) {
    console.error("[GET /api/events]", err);
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
    if (!body.title_en?.trim()) {
      return NextResponse.json({ error: "English title is required" }, { status: 400 });
    }

    const slug = body.slug?.trim()
      ? body.slug.trim()
      : `${toEventSlug(body.title_en)}-${Date.now().toString(36)}`;

    const event = await createEventPhoto({
      title_en: body.title_en.trim(),
      title_ne: body.title_ne?.trim() || null,
      description_en: body.description_en?.trim() || null,
      description_ne: body.description_ne?.trim() || null,
      location_en: body.location_en?.trim() || null,
      location_ne: body.location_ne?.trim() || null,
      event_date: body.event_date || null,
      cover_image: body.cover_image?.trim() || null,
      images: Array.isArray(body.images) ? body.images : [],
      slug,
      status: body.status === "draft" ? "draft" : "published",
      view_count: 0,
    });
    return NextResponse.json({ event }, { status: 201 });
  } catch (err: unknown) {
    console.error("[POST /api/events]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique") || msg.includes("slug")) {
      return NextResponse.json({ error: "Slug already exists — choose another." }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
