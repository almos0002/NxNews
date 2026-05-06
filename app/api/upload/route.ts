import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
];
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const apiKey = process.env.FREEIMAGE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Image uploads are not configured — FREEIMAGE_API_KEY is missing." },
      { status: 503 }
    );
  }

  let form: FormData | null = null;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Use JPEG, PNG, WebP, GIF or ICO." },
      { status: 400 }
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8 MB)." }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const body = new URLSearchParams();
    body.append("key", apiKey);
    body.append("source", base64);
    body.append("format", "json");

    const res = await fetch("https://freeimage.host/api/1/upload", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await res.json() as {
      status_code?: number;
      image?: { url?: string; display_url?: string };
      error?: { message?: string };
    };

    if (!res.ok || data.status_code !== 200) {
      const msg = data.error?.message ?? "Upload to image host failed.";
      console.error("[upload] freeimage.host error:", data);
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    const url = data.image?.display_url ?? data.image?.url;
    if (!url) {
      return NextResponse.json({ error: "No URL returned from image host." }, { status: 502 });
    }

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload] error:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
