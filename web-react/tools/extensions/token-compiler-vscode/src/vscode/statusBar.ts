import * as vscode from 'vscode'

export function updateStatusBar(
  statusBar: vscode.StatusBarItem,
  terminal: vscode.Terminal | undefined,
): void {

  if (terminal) {
    statusBar.text = '$(check) Token Compiler'
    statusBar.tooltip = 'Token Compiler: Active'
    statusBar.command = 'tokenCompilerVscode.stop'
  } else {
    statusBar.text = '$(circle-outline) Token Compiler'
    statusBar.tooltip = 'Token Compiler: Inactive'
    statusBar.command = 'tokenCompilerVscode.start'
  }
}