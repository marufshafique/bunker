#!/bin/sh
set -e

# Build DATABASE_URL from the DATABASE__* env vars provided by compose so that
# sqlx-cli can apply pending migrations before the app starts.
DATABASE_URL="postgres://${DATABASE__USERNAME}:${DATABASE__PASSWORD}@${DATABASE__HOST}:${DATABASE__PORT}/${DATABASE__DATABASE_NAME}"
export DATABASE_URL

echo "Running database migrations..."
sqlx migrate run

echo "Starting application..."
exec ./bunker
