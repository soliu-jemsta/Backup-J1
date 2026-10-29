#!/bin/bash
set -e

TIMESTAMP=$(date +%F_%H-%M-%S)
FILE="/backup/jemsta_${TIMESTAMP}.sql.gz"

echo "[$(date)] Starting dump..."
mysqldump --no-tablespaces -h "$DB_SERVER" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" | gzip > "$FILE"

echo "[$(date)] Copying to OneDrive-synced folder..."
cp "$FILE" /onedrive/

echo "[$(date)] Pruning local backups older than 56 days..."
find /backup -name "*.sql.gz" -mtime +56 -delete
find /onedrive -name "*.sql.gz" -mtime +56 -delete

echo "[$(date)] Done."