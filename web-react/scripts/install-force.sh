#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/projects.sh"
source "$SCRIPT_DIR/lib.sh"

project_name="$1"
shift

if [[ -z "$project_name" ]]; then
    echo "Usage: install-force.sh <project> <package> [package ...]" >&2
    exit 1
fi

packages=("$@")

if ((${#packages[@]} == 0)); then
    echo "Usage: install-force.sh <project> <package> [package ...]" >&2
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
echo "[install-force ${packages[*]}] $project"
echo "========================================"

cd "$ROOT/$project"

install_packages=()

for package in "${packages[@]}"; do
    dependency="$(npm pkg get "dependencies.$package" --json 2>/dev/null)"
    dev_dependency="$(npm pkg get "devDependencies.$package" --json 2>/dev/null)"

    if [[ "$dependency" == "undefined" && "$dev_dependency" == "undefined" ]]; then
        echo "SKIP: $package is not a dependency"
        continue
    fi

    echo "APPROVE: $package"
    npm install-scripts approve "$package"

    install_packages+=("$package@latest")
done

if ((${#install_packages[@]} == 0)); then
    exit 0
fi

echo
echo "INSTALL: ${install_packages[*]}"
npm install "${install_packages[@]}"