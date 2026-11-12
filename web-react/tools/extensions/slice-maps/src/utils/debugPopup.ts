import * as vscode from 'vscode'

export function debugPopup(string: string) {
  void vscode.window.showWarningMessage(string)
}
