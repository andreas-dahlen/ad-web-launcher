import * as vscode from 'vscode'
export async function requestGlob(): Promise<string | null> {
  const glob = await vscode.window.showInputBox({
    prompt: 'Add glob pattern',
    placeHolder: '**/pizzaSlice/**',
    validateInput: value => {
      const trimmed = value.trim()
      if (!trimmed) return 'Glob pattern cannot be empty'
      return null
    }
  })

  const trimmed = glob?.trim()

  return trimmed || null
}