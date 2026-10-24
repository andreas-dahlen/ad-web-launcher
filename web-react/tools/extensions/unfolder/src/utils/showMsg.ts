import * as vscode from 'vscode'

export function showMsg(string: string) {

  void vscode.window.showInformationMessage(string)
}

