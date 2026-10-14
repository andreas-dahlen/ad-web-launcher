import * as vscode from 'vscode'
import type { SliceProvider } from '../core/sliceProvider.ts'
import type { SliceFilter, SliceMap, Slice, VisualTreeNode } from '../types/core.types.ts'
import { normalizePaths } from '../utils/normalizePathType.ts'

type SingleCommand = VisualTreeNode | vscode.Uri
type ArrayCommand = VisualTreeNode[] | vscode.Uri[]

type CommandPath = [single: SingleCommand, array?: ArrayCommand]

export function register(
  context: vscode.ExtensionContext,
  provider: SliceProvider,
  output: vscode.OutputChannel
) {
  async function safe(
    name: string,
    action: () => Promise<void> | void
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
    vscode.window.createTreeView('sliceMaps', {
      treeDataProvider: provider.treeProvider,
      canSelectMany: true,
    }),
    provider.treeDisposable,

    //general

    vscode.commands.registerCommand(
      'sliceMaps.configure', (node: Slice) => safe('configure item',
        () => provider.general.changeConfig(node))),

    vscode.commands.registerCommand(
      'sliceMaps.missingConfig', (...args: CommandPath) => safe('Set Up SliceMaps',
        () => provider.general.missingConfig(normalizePaths(...args)))),

    vscode.commands.registerCommand(
      'sliceMaps.glob', (node: Slice) => safe('glob item',
        () => provider.general.addGlob(node))),

    vscode.commands.registerCommand(
      'sliceMaps.compressPreserved', (node: Slice) => safe('compress preserved',
        () => provider.general.compressPreserved(node))),

    //main

    vscode.commands.registerCommand(
      'sliceMaps.include', (...args: CommandPath) => safe('include in map',
        () => provider.map.include(normalizePaths(...args)))),

    vscode.commands.registerCommand(
      'sliceMaps.exclude', (...args: CommandPath) => safe('exclude from map',
        () => provider.map.exclude(normalizePaths(...args)))),

    vscode.commands.registerCommand(
      'sliceMaps.removeExcludeFilter', (...args: CommandPath) => safe('remove exclude from filter',
        () => provider.filter.removeExclude(normalizePaths(...args)))),

    vscode.commands.registerCommand(
      'sliceMaps.addExcludeFilter', (...args: CommandPath) => safe('add exclude to filter',
        () => provider.filter.addExclude(normalizePaths(...args)))),

    //Maps

    vscode.commands.registerCommand(
      'sliceMaps.create', () => safe('create map',
        () => provider.map.create())),

    vscode.commands.registerCommand(
      'sliceMaps.toggle', (map: SliceMap) => safe('toggle map',
        () => provider.map.toggle(map))),

    vscode.commands.registerCommand(
      'sliceMaps.rename', (map: SliceMap) => safe('rename map',
        () => provider.map.rename(map))),

    vscode.commands.registerCommand(
      'sliceMaps.delete', (map: SliceMap) => safe('delete map',
        () => provider.map.remove(map))),

    vscode.commands.registerCommand(
      'sliceMaps.reset', (map: SliceMap) => safe('reset map',
        () => provider.map.reset(map))),

    //Filter

    vscode.commands.registerCommand(
      'sliceMaps.createFilter', () => safe('create filter',
        () => provider.filter.create())),

    vscode.commands.registerCommand(
      'sliceMaps.toggleFilter', (filter: SliceFilter) => safe('toggle filter',
        () => provider.filter.toggle(filter))),

    vscode.commands.registerCommand(
      'sliceMaps.renameFilter', (filter: SliceFilter) => safe('rename filter',
        () => provider.filter.rename(filter))),

    vscode.commands.registerCommand(
      'sliceMaps.deleteFilter', (filter: SliceFilter) => safe('delete filter',
        () => provider.filter.remove(filter))),

    vscode.commands.registerCommand(
      'sliceMaps.resetFilter', (filter: SliceFilter) => safe('reset filter',
        () => provider.filter.reset(filter))),

    vscode.workspace.onDidChangeConfiguration(event => {
      if (!event.affectsConfiguration('sliceMaps')) {
        return
      }

      output.appendLine(
        '[slice maps] configuration changed. Need to reload. Not implemented yet'
      )

      //TODO  resolve configuration change behavior
    })
  )
}