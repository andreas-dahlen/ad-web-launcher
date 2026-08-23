#!/usr/bin/env bash

#!/usr/bin/env bash

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PROJECTS=("$ROOT")

while IFS= read -r -d '' pkg_json; do
    PROJECTS+=("$(dirname "$pkg_json")")
done < <(find "$ROOT/tools" -maxdepth 3 -name "package.json" -not -path "*/node_modules/*" -print0 | sort -z)