#!/usr/bin/env bash

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PROJECTS=(".")

for dir in "$ROOT/tools" "$ROOT/packages"; do
    while IFS= read -r -d '' pkg_json; do
        project="$(dirname "$pkg_json")"
        PROJECTS+=("${project#"$ROOT"/}")
    done < <(
        find "$dir" \
            -maxdepth 3 \
            -name "package.json" \
            -not -path "*/node_modules/*" \
            -print0 |
            sort -z
    )
done