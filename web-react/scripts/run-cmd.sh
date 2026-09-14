#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/projects.sh"
source "$SCRIPT_DIR/lib.sh"

npm_cmd="$1"; shift

if [[ -z "$npm_cmd" ]]; then
    echo "Usage: run-cmd.sh <npm-subcommand> [args]" >&2
    exit 1
fi

failed=()
skipped=()

for project in "${PROJECTS[@]}"; do
    echo
    echo "========================================"
    echo "[npm $npm_cmd] $project"
    echo "========================================"

    if ! ( cd "$project" && npm "$npm_cmd" "$@" ); then
        failed+=("$project")
    fi
done

print_summary failed skipped