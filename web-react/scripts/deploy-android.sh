#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEB_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$WEB_ROOT/.." && pwd)"

SOURCE="$WEB_ROOT/dist/index.html"
DEST="$PROJECT_ROOT/android/app/src/main/assets/index.html"

if [[ ! -f "$SOURCE" ]]; then
    echo "ERROR: Web build not found: $SOURCE"
    echo "Run 'npm run build' first."
    exit 1
fi

mkdir -p "$(dirname "$DEST")"
cp "$SOURCE" "$DEST"

echo "Synced web build to Android assets."