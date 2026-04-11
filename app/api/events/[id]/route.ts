import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getEventPhotoById, updateEventPhoto, deleteEventPhoto } from "@/lib/events";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const event = await getEventPhotoById(id);
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ event });
  } catch (err) {
    console.error("[GET /api/events/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role ?? "user";
    if (!["admin", "moderator"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const event = await updateEventPhoto(id, {
      title_en: body.title_en,
      title_ne: body.title_ne ?? null,
      description_en: body.description_en ?? null,
      description_ne: body.description_ne ?? null,
      location_en: body.location_en ?? null,
      location_ne: body.location_ne ?? null,
      event_date: body.event_date || null,
      cover_image: body.cover_image ?? null,
      images: Array.isArray(body.images) ? body.images : undefined,
      slug: body.slug,
      status: body.status,
    });
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ event });
  } catch (err: unknown) {
    console.error("[PUT /api/events/[id]]", err);
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique") || msg.includes("slug")) {
      return NextResponse.json({ error: "Slug already exists — choose another." }, { status: 409 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as { role?: string }).role ?? "user";
    if (!["admin", "moderator"].includes(role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const ok = await deleteEventPhoto(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/events/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
