#!/usr/bin/env bash
set -euo pipefail

APP_DIR=${APP_DIR:-/var/www/esn-ai-studio-dashboard}
cd "$APP_DIR"
git pull --ff-only
cp .env.example .env.example.reference
docker compose -f compose.yml up -d --build
