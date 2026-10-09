import * as vscode from 'vscode'
export async function requestGlob(): Promise<string | null> {
  const glob = await vscode.window.showInputBox({
    prompt: 'Add glob pattern',
    placeHolder: '**/pizzaSlice/**'
  })

  if (!glob) return null

  return glob
}