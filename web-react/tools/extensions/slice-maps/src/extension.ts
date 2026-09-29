import * as vscode from 'vscode'
import { createSliceProvider } from './core/createSliceProvider.ts'
import { register } from './vscode/register.ts'

export function activate(context: vscode.ExtensionContext): void {
  const root = vscode.workspace.workspaceFolders?.[0]

  if (!root) {
    return
  }

  const output = vscode.window.createOutputChannel('Slice Maps')

  context.subscriptions.push(output)

  output.appendLine('[slice maps] loaded')

  const maps = createSliceProvider(context, root, output)

  if (!maps) return

  register(context, maps, output)
}

export function deactivate(): void { }