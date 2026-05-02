import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { listVideos, createVideo, youtubeThumbnail } from "@/lib/content/videos";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const videos = await listVideos();
    return NextResponse.json({ videos });
  } catch (err) {
    console.error("[GET /api/videos]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { title_en, title_ne, youtube_url, description_en, description_ne, status, category, duration } = body;

    if (!title_en?.trim()) return NextResponse.json({ error: "English title is required" }, { status: 400 });
    if (!youtube_url?.trim()) return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });

    const thumbnail = youtubeThumbnail(youtube_url);
    const video = await createVideo({
      title_en: title_en.trim(), title_ne: (title_ne ?? "").trim(),
      youtube_url: youtube_url.trim(),
      description_en: (description_en ?? "").trim(), description_ne: (description_ne ?? "").trim(),
      thumbnail,
      category: (category ?? "").trim(),
      duration: (duration ?? "").trim(),
      status: status === "draft" ? "draft" : "published",
      author_id: session.user.id,
    });
    return NextResponse.json({ video }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/videos]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
