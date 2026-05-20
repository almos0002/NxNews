import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Individual file downloads are no longer supported. Use POST /api/backups to generate and download a backup directly." },
    { status: 410 }
  );
}
