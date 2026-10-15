import * as vscode from 'vscode'

export function showMsg(string: string) {

  vscode.window.showInformationMessage(string)
}

