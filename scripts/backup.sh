#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-backups}"
KEEP_DAYS="${KEEP_DAYS:-7}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/neon_backup_$TIMESTAMP.dump"

mkdir -p "$BACKUP_DIR"

if [ -z "${NEON_DATABASE_URL:-}" ]; then
  echo "[backup] ERROR: NEON_DATABASE_URL is not set." >&2
  exit 1
fi

echo "[backup] Starting backup at $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
pg_dump -d "$NEON_DATABASE_URL" \
  --no-password \
  --format=custom \
  --file="$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[backup] Saved $BACKUP_FILE ($SIZE)"

echo "[backup] Removing backups older than $KEEP_DAYS days..."
find "$BACKUP_DIR" -name "neon_backup_*.dump" -mtime +$KEEP_DAYS -print -delete

REMAINING=$(find "$BACKUP_DIR" -name "neon_backup_*.dump" | wc -l)
echo "[backup] Done. $REMAINING backup(s) on disk."
