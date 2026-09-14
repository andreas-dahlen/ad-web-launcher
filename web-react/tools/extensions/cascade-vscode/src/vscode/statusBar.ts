import * as vscode from 'vscode'

export function updateStatusBar(
  statusBar: vscode.StatusBarItem,
  terminal: vscode.Terminal | undefined,
): void {

  if (terminal) {
    statusBar.text = '$(check) Cascade Compiler'
    statusBar.tooltip = 'Cascade Compiler: Active'
    statusBar.command = 'cascade.stop'
  } else {
    statusBar.text = '$(circle-outline) Cascade Compiler'
    statusBar.tooltip = 'Cascade Compiler: Inactive'
    statusBar.command = 'cascade.start'
  }
}