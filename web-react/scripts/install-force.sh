#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/projects.sh"
source "$SCRIPT_DIR/lib.sh"

package="$1"

if [[ -z "$package" ]]; then
    echo "Usage: install-force.sh <package>" >&2
    exit 1
fi

failed=()

for project in "${PROJECTS[@]}"; do
    echo
    echo "========================================"
    echo "[install-force $package] $project"
    echo "========================================"

    if ! (
        cd "$project"

        dependency="$(npm pkg get "dependencies.$package" --json 2>/dev/null)"
        dev_dependency="$(npm pkg get "devDependencies.$package" --json 2>/dev/null)"

        if [[ "$dependency" == "undefined" && "$dev_dependency" == "undefined" ]]; then
            echo "SKIP: $package is not a dependency"
            exit 0
        fi

        echo "APPROVE: $package"
        npm install-scripts approve "$package"

        echo
        echo "INSTALL: $package@latest"
        npm install "$package@latest"
    ); then
        failed+=("$project")
    fi
done

if ((${#failed[@]})); then
    echo
    echo "========================================"
    echo "Failed projects"
    echo "========================================"

    printf '  %s\n' "${failed[@]}"
    exit 1
fi