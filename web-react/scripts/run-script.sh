#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/projects.sh"
source "$SCRIPT_DIR/lib.sh"

npm_script="$1"; shift
if [[ "$1" == "--" ]]; then shift; fi

if [[ -z "$npm_script" ]]; then
    echo "Usage: run-script.sh <npm-script-name> [-- extra args]" >&2
    exit 1
fi

failed=()
skipped=()

for project in "${PROJECTS[@]}"; do
    echo
    echo "========================================"
    echo "[$npm_script] $project"
    echo "========================================"

    def="$(cd "$project" && npm pkg get "scripts.$npm_script" --json 2>/dev/null)"

    if [[ -z "$def" || "$def" == "{}" || "$def" == "null" ]]; then
        skipped+=("$project")
        echo "SKIP: no \"$npm_script\" script"
        continue
    fi

    if ! ( cd "$project" && npm run "$npm_script" -- "$@" ); then
        failed+=("$project")
    fi
done

print_summary failed skipped