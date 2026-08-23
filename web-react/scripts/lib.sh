#!/usr/bin/env bash

print_summary() {
    local -n _failed=$1
    local -n _skipped=$2

    echo
    echo "========================================"
    echo "Summary"
    echo "========================================"

    if ((${#_failed[@]} > 0)); then
        echo "Failed projects:"
        for p in "${_failed[@]}"; do echo "  $p"; done
    fi

    if ((${#_skipped[@]} > 0)); then
        echo
        echo "Skipped projects:"
        for p in "${_skipped[@]}"; do echo "  $p"; done
    fi

    if ((${#_failed[@]} > 0)); then
        return 1
    fi

    echo
    echo "All available runs succeeded."
    return 0
}