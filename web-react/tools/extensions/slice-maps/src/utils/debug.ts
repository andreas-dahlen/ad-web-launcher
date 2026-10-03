import * as vscode from 'vscode'

export type Debug = NonNullable<ReturnType<typeof createDebug>>
export function createDebug(output: vscode.OutputChannel) {
  return function debug(
    label: string,
    value: unknown
  ): void {
    output.appendLine(
      `[DEBUG] ${label}: ${JSON.stringify(value, null, 2)}`
    )
  }
}