import * as vscode from 'vscode'
import type { SliceProvider } from '../core/createSliceProvider.ts'
import type { UUID } from 'node:crypto'
import type { SliceMap } from '../types/dataStructure.types.ts'

export function register(
  context: vscode.ExtensionContext,
  maps: SliceProvider,
  output: vscode.OutputChannel
) {
  async function safe(
    name: string,
    action: () => Promise<void>
  ): Promise<void> {
    try {
      await action()
    } catch (error) {
      output.appendLine(`[ERROR] ${name}`)
      output.appendLine(
        error instanceof Error
          ? error.stack ?? error.message
          : String(error)
      )
    }
  }

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      'sliceMaps',
      maps.treeProvider
    ),

    vscode.commands.registerCommand(
      'sliceMaps.create',
      () => safe('create slice', () => maps.createSliceMap())
    ),

    vscode.commands.registerCommand(
      'sliceMaps.toggle',
      (id: UUID) => safe('toggle slice', () => maps.toggleSliceMap(id))
    ),

    vscode.commands.registerCommand(
      'sliceMaps.configure',
      (map: SliceMap) => safe(
        'configure slice',
        () => maps.toggleConfig(map.id)
      )
    ),

    vscode.commands.registerCommand(
      'sliceMaps.rename',
      (map: SliceMap) => safe(
        'rename slice',
        () => maps.renameSliceMap(map.id)
      )
    ),

    vscode.commands.registerCommand(
      'sliceMaps.delete',
      (map: SliceMap) => safe(
        'delete slice',
        () => maps.removeSliceMap(map.id)
      )
    ),

    vscode.commands.registerCommand(
      'sliceMaps.reset',
      (map: SliceMap) => safe(
        'reset slice',
        () => maps.resetSliceMap(map)
      )
    ),

    vscode.commands.registerCommand(
      'sliceMaps.include',
      (_, uris: vscode.Uri[]) => safe(
        'include in slice',
        () => maps.addPathsToSliceMap(uris)
      )
    ),

    vscode.commands.registerCommand(
      'sliceMaps.exclude',
      (_, uris: vscode.Uri[]) => safe(
        'exclude from slice',
        () => maps.removePathsFromSliceMap(uris)
      )
    ),


    vscode.workspace.onDidChangeConfiguration(event => {
      if (!event.affectsConfiguration('sliceMaps')) {
        return
      }

      output.appendLine(
        '[slice maps] configuration changed. Need to reload. Not implemented yet'
      )

      //TODO add user settings and resolve configuration change behavior
    })
  )
}