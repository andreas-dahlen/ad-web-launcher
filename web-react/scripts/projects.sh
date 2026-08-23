#!/usr/bin/env bash

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PROJECTS=(
  "$ROOT"
  "$ROOT/tools/eslint"
  "$ROOT/tools/token-compiler"
  "$ROOT/tools/extensions/css-variable-completion"
  "$ROOT/tools/extensions/token-compiler-vscode"
)