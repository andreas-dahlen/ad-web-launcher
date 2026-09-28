import * as vscode from 'vscode'
import type { SliceProvider } from '../core/createSliceProvider.ts'
import type { UUID } from 'node:crypto'
import type { SliceMap } from '../types/dataStructure.types.ts'

export function register(
  context: vscode.ExtensionContext,
  maps: SliceProvider,
  output: vscode.OutputChannel) {

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('sliceMaps',
      maps.treeProvider,
    ),

    vscode.commands.registerCommand('sliceMaps.create', () => {
      maps.createSliceMap()
    }),

    vscode.commands.registerCommand('sliceMaps.activate', (id: UUID) => {
      maps.toggleSliceMap(id as UUID)
    }),

    vscode.commands.registerCommand(
      'sliceMaps.rename',
      (map: SliceMap) => maps.renameSliceMap(map.id as UUID)
    ),

    vscode.commands.registerCommand(
      'sliceMaps.delete',
      (map: SliceMap) => maps.removeSliceMap(map.id as UUID)
    ),

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