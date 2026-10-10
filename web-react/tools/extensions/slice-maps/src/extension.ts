import * as vscode from 'vscode'
import { createSliceProvider } from './core/sliceProvider.ts'
import { register } from './vscode/register.ts'

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const root = vscode.workspace.workspaceFolders?.[0]

  if (!root) {
    return
  }
  // await context.workspaceState.update('sliceMaps', undefined)

  const output = vscode.window.createOutputChannel('Slice Maps')

  context.subscriptions.push(output)

  const provider = createSliceProvider(context, root, output)

  await provider.general.startup()

  register(context, provider, output)


  output.appendLine('[slice maps] loaded')
}

export function deactivate(): void { }