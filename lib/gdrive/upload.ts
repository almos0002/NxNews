import { google } from "googleapis";
import { Readable } from "stream";

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set.");
  const credentials = JSON.parse(raw);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
}

export async function uploadToDrive(
  filename: string,
  content: string,
  folderId: string
): Promise<{ id: string; webViewLink: string }> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const stream = Readable.from([content]);

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      mimeType: "application/sql",
      parents: [folderId],
    },
    media: {
      mimeType: "application/sql",
      body: stream,
    },
    fields: "id,webViewLink",
  });

  return {
    id: res.data.id ?? "",
    webViewLink: res.data.webViewLink ?? "",
  };
}

export async function deleteOldBackups(folderId: string, keepDays: number = 7): Promise<number> {
  const auth = getAuth();
  const drive = google.drive({ version: "v3", auth });

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - keepDays);
  const cutoffStr = cutoff.toISOString();

  const res = await drive.files.list({
    q: `'${folderId}' in parents and name contains 'neon_backup_' and createdTime < '${cutoffStr}' and trashed = false`,
    fields: "files(id,name)",
  });

  const files = res.data.files ?? [];
  for (const file of files) {
    if (file.id) {
      await drive.files.delete({ fileId: file.id });
    }
  }
  return files.length;
}
