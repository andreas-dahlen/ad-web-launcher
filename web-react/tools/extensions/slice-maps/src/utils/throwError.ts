import * as vscode from 'vscode'

export function throwError(string: string): never {

  void vscode.window.showErrorMessage(string)
  throw new Error(string)
}

