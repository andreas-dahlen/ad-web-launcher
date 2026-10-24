import * as vscode from 'vscode'
import { createSliceProvider } from './core/sliceProvider.ts'
import { register } from './vscode/register.ts'

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const output = vscode.window.createOutputChannel('Slice Maps')
  context.subscriptions.push(output)

  const root = vscode.workspace.workspaceFolders?.[0]

  if (!root) {
    output.appendLine(`[ERROR] couldn't resolve workspace Root`)
    void vscode.window.showErrorMessage(
      'Slice Maps requires an open workspace.'
    )
    return
  }
  // await context.workspaceState.update('sliceMaps', undefined)

  try {

    const provider = createSliceProvider(context, root)
    await provider.ctrl.general.startup()
    register(context, provider, output)

    output.appendLine("[Slice Maps] Initialization success")

  } catch (error) {

    output.appendLine('[ERROR] Extension activation failed')
    output.appendLine(error instanceof Error
      ? error.stack ?? error.message
      : String(error))

    void vscode.window.showErrorMessage('Slice Maps failed to start. See the Slice Maps output channel for details.')
  }
}

export function deactivate(): void { }