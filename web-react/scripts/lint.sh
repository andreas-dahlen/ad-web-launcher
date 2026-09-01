#!/usr/bin/env bash

set -e

target="$1"

if [ -d "$target" ]; then
    style_scope="$target"
else
    style_scope="$(dirname "$target")"
fi

npx oxlint "$target"
npx eslint "$target"
npx stylelint "$style_scope/**/*.css"