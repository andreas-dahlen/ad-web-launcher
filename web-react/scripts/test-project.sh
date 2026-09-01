
#!/usr/bin/env bash

set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

source "$ROOT/scripts/projects.sh"

target="$1"
shift

for project in "${PROJECTS[@]}"; do
    [[ "$project" == "." ]] && continue

    if [[ "$target" == "$project" ]]; then
        cd "$ROOT/$project"
        npm run test -- "$@"
        exit
    fi

    if [[ "$target" == "$project/"* ]]; then
        rest="${target#"$project"/}"

        cd "$ROOT/$project"
        npm run test -- "$rest" "$@"
        exit
    fi
done

cd "$ROOT"
npm run test -- "$target" "$@"