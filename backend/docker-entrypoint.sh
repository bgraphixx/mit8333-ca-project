#!/bin/sh
set -e

echo "Applying database migrations..."
attempt=0
until alembic upgrade head; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "Migrations failed after $attempt attempts (is the database up?), giving up."
    exit 1
  fi
  echo "Retrying migrations in 2s... (attempt $attempt/30)"
  sleep 2
done

echo "Seeding roles and categories (no-op if already present)..."
python seed.py

echo "Starting application..."
exec "$@"
