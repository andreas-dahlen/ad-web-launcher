#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

dependency="$1"

if [[ -z "$dependency" ]]; then
    echo "Usage: $0 <dependency>"
    exit 1
fi

source "$SCRIPT_DIR/projects.sh"

echo
echo "========================================"
echo "Dependency: $dependency"
echo "========================================"

for project in "${PROJECTS[@]}"; do
    if [[ "$project" == "." ]]; then
        project_path="$ROOT"
        relative="."

        imports="$(
            rg -l \
                --glob '*.{ts,tsx,js,jsx,mts,mjs,cts,cjs}' \
                --glob '!tools/**' \
                "from ['\"]${dependency}['\"]|require\(['\"]${dependency}['\"]\)" \
                "$project_path" 2>/dev/null || true
        )"
    else
        project_path="$ROOT/$project"
        relative="$project"

        imports="$(
            rg -l \
                --glob '*.{ts,tsx,js,jsx,mts,mjs,cts,cjs}' \
                "from ['\"]${dependency}['\"]|require\(['\"]${dependency}['\"]\)" \
                "$project_path" 2>/dev/null || true
        )"
    fi

    package_json="$project_path/package.json"

    [[ -f "$package_json" ]] || continue
    [[ -n "$imports" ]] || continue

    declared_as="$(
        node -e "
            const pkg = require(process.argv[1])
            const dep = process.argv[2]

            if (pkg.dependencies?.[dep])
                console.log('dependency')
            else if (pkg.devDependencies?.[dep])
                console.log('devDependency')
            " "$package_json" "$dependency"
    )"

    if [[ -n "$declared_as" ]]; then
        status="YES — $declared_as"
    else
        status="MISSING dependency"
    fi

    echo
    echo "$relative"
    echo "  $status"

    while IFS= read -r file; do
        echo "  ${file#"$project_path/"}"
    done <<< "$imports"
done