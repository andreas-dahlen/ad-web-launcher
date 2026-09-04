#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/projects.sh"
source "$SCRIPT_DIR/lib.sh"

packages=("$@")

if ((${#packages[@]} == 0)); then
    echo "Usage: install-force.sh <package> [package ...]" >&2
    exit 1
fi

failed=()

for project in "${PROJECTS[@]}"; do
    echo
    echo "========================================"
    echo "[install-force ${packages[*]}] $project"
    echo "========================================"

    if ! (
        cd "$project"

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