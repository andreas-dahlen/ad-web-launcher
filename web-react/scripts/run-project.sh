#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/projects.sh"

npm_cmd="$1"
shift

if [[ -z "$npm_cmd" ]]; then
    echo "Usage: run-project.sh <npm-subcommand> [script] <project> [args...]" >&2
    exit 1
fi

if [[ "$npm_cmd" == "run" ]]; then
    npm_script="$1"
    shift

    if [[ -z "$npm_script" ]]; then
        echo "Usage: run-project.sh run <script> <project> [args...]" >&2
        exit 1
    fi

    npm_cmd=("run" "$npm_script")
else
    npm_cmd=("$npm_cmd")
fi

project_name="$1"
shift

if [[ -z "$project_name" ]]; then
    echo "Usage: run-project.sh <npm-subcommand> [script] <project> [args...]" >&2
    exit 1
fi

project=""

for candidate in "${PROJECTS[@]}"; do
    if [[ "$candidate" == "$project_name" ]]; then
        project="$candidate"
        break
    fi

    package_json="$ROOT/$candidate/package.json"

    if [[ -f "$package_json" ]]; then
        package_name="$(node -e '
            const fs = require("fs")
            const pkg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"))
            process.stdout.write(pkg.name ?? "")
        ' "$package_json")"

        if [[ "$package_name" == "$project_name" ]]; then
            project="$candidate"
            break
        fi
    fi
done

if [[ -z "$project" ]]; then
    echo "Unknown project: $project_name" >&2
    exit 1
fi

echo
echo "========================================"
echo "[npm ${npm_cmd[*]}] $project"
echo "========================================"

cd "$ROOT/$project"
if [[ "${npm_cmd[0]}" == "run" ]]; then
    npm "${npm_cmd[@]}" -- "$@"
else
    npm "${npm_cmd[@]}" "$@"
fi