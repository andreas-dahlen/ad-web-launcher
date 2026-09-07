#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/projects.sh"

for project in "${PROJECTS[@]}"; do
    echo
    echo "========================================"
    echo "[knip] $project"
    echo "========================================"

    if ! npx knip --workspace "$ROOT/$project" --no-exit-code "$@"; then
        echo "SKIP: not a Knip workspace"
    fi
done