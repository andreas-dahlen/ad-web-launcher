import * as vscode from 'vscode'
import { createSliceProvider } from './core/createSliceProvider.ts'
import { register } from './vscode/register.ts'

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const root = vscode.workspace.workspaceFolders?.[0]

  if (!root) {
    return
  }

  const output = vscode.window.createOutputChannel('Slice Maps')

  context.subscriptions.push(output)

  output.appendLine('[slice maps] loaded')

  const provider = createSliceProvider(context, root, output)

  await provider.startup()

  register(context, provider, output)
}

export function deactivate(): void { }