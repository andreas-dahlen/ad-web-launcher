#!/usr/bin/env bash
set -Eeuo pipefail

vsix="${1:?Usage: install-vsix.sh <path-to-vsix>}"
vsix="$(realpath "$vsix")"

if [[ ! -f "$vsix" ]]; then
    echo "Error: VSIX not found: $vsix" >&2
    exit 1
fi

windows_cli='/mnt/c/Users/david.DALLEN/AppData/Local/Programs/Microsoft VS Code/bin/code.cmd'
windows_temp='/mnt/c/Users/david.DALLEN/AppData/Local/Temp'

if [[ ! -f "$windows_cli" ]]; then
    echo "Error: Windows VS Code CLI not found: $windows_cli" >&2
    exit 1
fi

if [[ ! -d "$windows_temp" ]]; then
    echo "Error: Windows temporary directory not found: $windows_temp" >&2
    exit 1
fi

# Use the source filename to avoid hard-coding a specific extension.
windows_vsix="$windows_temp/$(basename "$vsix")"

# Remove the temporary VSIX when the script exits.
cleanup() {
    rm -f "$windows_vsix"
}
trap cleanup EXIT

echo "==> Copying VSIX to Windows..."
cp "$vsix" "$windows_vsix"

echo "==> Installing into Windows VS Code..."

windows_cli="$(wslpath -w "$windows_cli")"
windows_vsix="$(wslpath -w "$windows_vsix")"

ps_command="& { & '${windows_cli}' --install-extension '${windows_vsix}' --force; exit \$LASTEXITCODE }"

powershell.exe -NoProfile -NonInteractive -Command \
    "Set-Location \$env:TEMP; $ps_command"

echo "==> Installation complete: $(basename "$vsix")"