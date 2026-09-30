import * as vscode from 'vscode'
import { createSliceProvider, type SliceProvider } from './core/createSliceProvider.ts'
import { register } from './vscode/register.ts'

type State = {
  maps: SliceProvider | undefined
}

const state: State = {
  maps: undefined
}
export function activate(context: vscode.ExtensionContext): void {
  const root = vscode.workspace.workspaceFolders?.[0]

  if (!root) {
    return
  }

  const output = vscode.window.createOutputChannel('Slice Maps')

  context.subscriptions.push(output)

  output.appendLine('[slice maps] loaded')

  state.maps = createSliceProvider(context, root, output)

  if (!state.maps) return

  register(context, state.maps, output)
}

export async function deactivate(): Promise<void> {
  await state.maps?.deactivate()
}