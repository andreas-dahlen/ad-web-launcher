import * as vscode from 'vscode'
import type { SliceProvider } from '../core/newProvider.ts'
import type { SliceFilter, SliceMap, Slice } from '../types/dataStructure.types.ts'

export function register(
  context: vscode.ExtensionContext,
  provider: SliceProvider,
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
      provider.treeProvider
    ),

    vscode.commands.registerCommand(
      'sliceMaps.configure',
      (node: Slice) => safe(
        'configure item',
        () => provider.toggleConfig(node)
      )
    ),
    vscode.commands.registerCommand(
      'sliceMaps.include',
      (_, uris: vscode.Uri[]) => safe(
        'include in map',
        () => provider.include(uris)
      )
    ),

    vscode.commands.registerCommand(
      'sliceMaps.exclude',
      (_, uris: vscode.Uri[]) => safe(
        'exclude from map',
        () => provider.exclude(uris)
      )
    ),
    vscode.commands.registerCommand(
      'sliceMaps.removeExcludeFilter',
      (_, uris: vscode.Uri[]) => safe(
        'remove exclude from filter',
        () => provider.removeExcludeFilter(uris)
      )
    ),

    vscode.commands.registerCommand(
      'sliceMaps.addExcludeFilter',
      (_, uris: vscode.Uri[]) => safe(
        'add exclude to filter',
        () => provider.addExcludeFilter(uris)
      )
    ),

    vscode.commands.registerCommand(
      'sliceMaps.create',
      () => safe('create map', () => provider.map.create())
    ),

    vscode.commands.registerCommand(
      'sliceMaps.toggle',
      (map: SliceMap) => safe(
        'toggle map',
        () => provider.map.toggle(map)
      )
    ),


    vscode.commands.registerCommand(
      'sliceMaps.rename',
      (map: SliceMap) => safe(
        'rename map',
        () => provider.map.rename(map)
      )
    ),

    vscode.commands.registerCommand(
      'sliceMaps.delete',
      (map: SliceMap) => safe(
        'delete map',
        () => provider.map.remove(map)
      )
    ),

    vscode.commands.registerCommand(
      'sliceMaps.reset',
      (map: SliceMap) => safe(
        'reset map',
        () => provider.map.reset(map)
      )
    ),

    //Filter

    vscode.commands.registerCommand(
      'sliceMaps.createFilter',
      () => safe('create filter', () => provider.filter.create())
    ),

    vscode.commands.registerCommand(
      'sliceMaps.toggleFilter',
      (filter: SliceFilter) => safe(
        'toggle filter',
        () => provider.filter.toggle(filter)
      )
    ),


    vscode.commands.registerCommand(
      'sliceMaps.renameFilter',
      (filter: SliceFilter) => safe(
        'rename filter',
        () => provider.filter.rename(filter)
      )
    ),

    vscode.commands.registerCommand(
      'sliceMaps.deleteFilter',
      (filter: SliceFilter) => safe(
        'delete filter',
        () => provider.filter.remove(filter)
      )
    ),

    vscode.commands.registerCommand(
      'sliceMaps.resetFilter',
      (filter: SliceFilter) => safe(
        'reset filter',
        () => provider.filter.reset(filter)
      )
    ),

    // vscode.commands.registerCommand(
    //   'sliceMaps.addExcludeFilter',
    //   (_, uris: vscode.Uri[]) => safe(
    //     'add exclude filter',
    //     () => provider.filter.addPathsToFilter(uris)
    //   )
    // ),

    // vscode.commands.registerCommand(
    //   'sliceMaps.removeExcludeFilter',
    //   (_, uris: vscode.Uri[]) => safe(
    //     'remove exclude filter',
    //     () => provider.filter.removePathsFromFilter(uris)
    //   )
    // ),



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