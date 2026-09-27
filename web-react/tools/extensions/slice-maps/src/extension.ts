import * as vscode from 'vscode'
import { createSliceProvider } from './core/createSliceProvider.ts'

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('Slice Maps')

  context.subscriptions.push(output)

  output.appendLine('[slice maps] loaded')

  //probably load current config here... because i want to make sure there is a settings.json file.... and possibly a workspace aswell if that is a requierment .... if no config appendline and shut down?

  const maps = createSliceProvider(context, output)

  if (!maps) return

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('sliceMaps',
      maps.treeProvider,
    ),

    vscode.commands.registerCommand('sliceMaps.create', () => {
      maps.createSliceMap()
    }),

    vscode.commands.registerCommand('sliceMaps.activate', (id: string) => {
      maps.toggleSliceMap(id)
    }),

    vscode.workspace.onDidChangeConfiguration(event => {
      if (!event.affectsConfiguration('sliceMaps')) {
        return
      }

      output.appendLine('[slice maps] configuration changed')
      maps.reload()
    })

    //need a watcher on the settings.json file... and reload there aswell...?
  )
}

export function deactivate(): void { }