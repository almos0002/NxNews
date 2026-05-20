import { NextResponse } from "next/server";
import { generateSqlDump } from "@/lib/db/backup";
import { uploadToDrive, deleteOldBackups } from "@/lib/gdrive/upload";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");

  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const folderId = process.env.GDRIVE_FOLDER_ID;
  if (!folderId) {
    return NextResponse.json({ error: "GDRIVE_FOLDER_ID is not set." }, { status: 500 });
  }

  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    return NextResponse.json({ error: "GOOGLE_SERVICE_ACCOUNT_JSON is not set." }, { status: 500 });
  }

  try {
    const { sql, filename } = await generateSqlDump();
    const { id, webViewLink } = await uploadToDrive(filename, sql, folderId);
    const deleted = await deleteOldBackups(folderId, 7);

    console.log(`[backup] Uploaded ${filename} to Google Drive (id: ${id}). Deleted ${deleted} old backup(s).`);

    return NextResponse.json({
      ok: true,
      filename,
      driveFileId: id,
      webViewLink,
      deletedOldBackups: deleted,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Scheduled backup failed";
    console.error("[backup] Scheduled backup error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
