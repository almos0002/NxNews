import { execFile } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, "backup.sh");
const INTERVAL_MS = 24 * 60 * 60 * 1000;

function runBackup() {
  const now = new Date().toISOString();
  console.log(`[scheduler] Running backup at ${now}`);

  execFile("bash", [SCRIPT], { env: process.env }, (err, stdout, stderr) => {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
    if (err) {
      console.error(`[scheduler] Backup FAILED: ${err.message}`);
    } else {
      console.log(`[scheduler] Backup completed successfully.`);
    }
    console.log(`[scheduler] Next backup in 24 hours.`);
  });
}

console.log("[scheduler] Daily backup scheduler started.");
runBackup();
setInterval(runBackup, INTERVAL_MS);
