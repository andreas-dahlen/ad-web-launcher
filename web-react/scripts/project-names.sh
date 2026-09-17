#!/usr/bin/env bash

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

node -e '
    const fs = require("fs")
    const pkg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"))
    if (pkg.name) console.log(pkg.name)
' "$ROOT/package.json"

for dir in "$ROOT/tools" "$ROOT/packages"; do
    while IFS= read -r -d '' pkg_json; do
        node -e '
            const fs = require("fs")
            const pkg = JSON.parse(fs.readFileSync(process.argv[1], "utf8"))
            if (pkg.name) console.log(pkg.name)
        ' "$pkg_json"
    done < <(
        find "$dir" \
            -maxdepth 3 \
            -name "package.json" \
            -not -path "*/node_modules/*" \
            -print0 |
            sort -z
    )
done