import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getVideoById, updateVideo, deleteVideo, youtubeThumbnail } from "@/lib/content/videos";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const video = await getVideoById(id);
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ video });
  } catch (err) {
    console.error("[GET /api/videos/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    const thumbnail = body.youtube_url ? youtubeThumbnail(body.youtube_url) : undefined;
    const video = await updateVideo(id, { ...body, thumbnail });
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ video });
  } catch (err) {
    console.error("[PUT /api/videos/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const ok = await deleteVideo(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/videos/[id]]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
