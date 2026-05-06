import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/x-icon", "image/vnd.microsoft.icon"];
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return NextResponse.json(
      { error: "Image uploads are not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET." },
      { status: 503 }
    );
  }

  try {
    const form = await req.formData().catch(() => null);
    if (!form) {
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

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "kumarihub",
            resource_type: "image",
            use_filename: false,
            unique_filename: true,
          },
          (error, res) => {
            if (error || !res) reject(error ?? new Error("Upload failed"));
            else resolve(res as { secure_url: string });
          }
        )
        .end(buffer);
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (err) {
    console.error("[upload] error:", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
