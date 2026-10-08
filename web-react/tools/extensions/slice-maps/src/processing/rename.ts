import * as vscode from 'vscode'

export async function renameMap(): Promise<string | null> {


  const name = await vscode.window.showInputBox({
    prompt: 'Slice map name',
    placeHolder: 'Pizza Slice'
  })

  if (!name) return null

  return name
}

export async function renameFilter(): Promise<string | null> {
  const name = await vscode.window.showInputBox({
    prompt: 'Slice filter name',
    placeHolder: 'Source files'
  })

  if (!name) return null

  return name
}