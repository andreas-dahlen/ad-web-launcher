import * as vscode from 'vscode'

export const debugFlags: Record<string, boolean> = {
  resolution: false,
  compression: false,
  provider: false,
  exclusionHandler: false
}

export function createDebug(
  output: vscode.OutputChannel,
  category?: string
) {
  if (category && debugFlags[category] === false) {
    return () => { }
  }

  return function debug(label: string, value: unknown): void {
    output.appendLine(
      `[DEBUG][${category}] ${label}: ${JSON.stringify(value, null, 2)}`
    )
  }
}