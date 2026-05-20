import { Storage } from "@google-cloud/storage";

function getStorage(): Storage {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set.");
  const credentials = JSON.parse(raw);
  return new Storage({ credentials });
}

export async function uploadToGCS(
  filename: string,
  content: string,
  bucketName: string
): Promise<{ gcsUri: string; publicUrl: string }> {
  const storage = getStorage();
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(`backups/${filename}`);

  await file.save(content, {
    contentType: "application/sql",
    metadata: { cacheControl: "no-cache" },
  });

  const gcsUri = `gs://${bucketName}/backups/${filename}`;
  const publicUrl = `https://storage.googleapis.com/${bucketName}/backups/${filename}`;

  return { gcsUri, publicUrl };
}

export async function deleteOldBackups(
  bucketName: string,
  keepDays: number = 7
): Promise<number> {
  const storage = getStorage();
  const bucket = storage.bucket(bucketName);
  const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;

  const [files] = await bucket.getFiles({ prefix: "backups/neon_backup_" });
  let deleted = 0;
  for (const file of files) {
    const created = file.metadata?.timeCreated
      ? new Date(file.metadata.timeCreated as string).getTime()
      : 0;
    if (created && created < cutoff) {
      await file.delete();
      deleted++;
    }
  }
  return deleted;
}
