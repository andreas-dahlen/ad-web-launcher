#!/usr/bin/env bash

failed=()
skipped=()

for project in "${PROJECTS[@]}"; do
    echo
    echo "========================================"
    echo "Testing: $project"
    echo "========================================"

    if ! test_script="$(cd "$project" && npm pkg get scripts.test --json 2>/dev/null)"; then
        skipped+=("$project")
        echo "SKIP: unable to inspect package.json"
        continue
    fi

    if [[ "$test_script" == "null" ]]; then
        skipped+=("$project")
        echo "SKIP: no test script"
        continue
    fi

    if ! (
        cd "$project"
        npm run test -- --run --reporter=dot
    ); then
        failed+=("$project")
    fi
done

echo
echo "========================================"
echo "Test Summary"
echo "========================================"

if ((${#failed[@]} > 0)); then
    echo "Failed projects:"
    for project in "${failed[@]}"; do
        echo "  $project"
    done
fi

if ((${#skipped[@]} > 0)); then
    echo
    echo "Skipped projects:"
    for project in "${skipped[@]}"; do
        echo "  $project"
    done
fi

if ((${#failed[@]} > 0)); then
    exit 1
fi

echo
echo "All available test suites passed."