#!/usr/bin/env bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$SCRIPT_DIR/projects.sh"

echo "Found ${#PROJECTS[@]} projects"

source "$SCRIPT_DIR/test.sh"