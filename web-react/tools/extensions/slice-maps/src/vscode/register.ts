import * as vscode from 'vscode'
import type { SliceProvider } from '../core/sliceProvider.ts'
import type { SliceFilter, SliceMap, Slice, WorkspaceTreeNode } from '../types/core.types.ts'
import { normalizeExplorerPaths, normalizeTreePaths } from '../utils/normalizePathType.ts'

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

  // provider.general.setSliceViews([sliceMapsView, sliceMapsWorkspaceView])

  context.subscriptions.push(
    provider.sliceMapsView,
    provider.sliceMapsWorkspaceView,
    provider.workspaceView,
    provider.sliceTreeDisposable,
    provider.workspaceTreeDisposable,
    //general

    vscode.commands.registerCommand(
      'sliceMaps.configure', (node: Slice) => safe('configure item',
        () => provider.ctrl.general.changeConfig(node))),

    vscode.commands.registerCommand(
      'sliceMaps.deactivateAll', () => safe('deactivate all',
        () => provider.ctrl.general.deactivateAll())),

    vscode.commands.registerCommand(
      'sliceMaps.glob', (node: Slice) => safe('glob item',
        () => provider.ctrl.general.addGlob(node))),

    vscode.commands.registerCommand(
      'sliceMaps.compressPreserved', (node: Slice) => safe('compress preserved',
        () => provider.ctrl.general.compressPreserved(node))),

    //main
    vscode.commands.registerCommand(
      'sliceMaps.missingConfig', (_, uris: vscode.Uri[]) => safe('Set Up SliceMaps',
        async () => provider.ctrl.general.missingConfig(await normalizeExplorerPaths(uris)))),

    vscode.commands.registerCommand(
      'sliceMaps.include', (_, uris: vscode.Uri[]) => safe('include in map',
        async () => provider.ctrl.map.include(await normalizeExplorerPaths(uris)))),

    vscode.commands.registerCommand(
      'sliceMaps.exclude', (_, uris: vscode.Uri[]) => safe('exclude from map',
        async () => provider.ctrl.map.exclude(await normalizeExplorerPaths(uris)))),

    vscode.commands.registerCommand(
      'sliceMaps.removeExcludeFilter', (_, uris: vscode.Uri[]) => safe('remove exclude from filter',
        async () => provider.ctrl.filter.removeExclude(await normalizeExplorerPaths(uris)))),

    vscode.commands.registerCommand(
      'sliceMaps.addExcludeFilter', (_, uris: vscode.Uri[]) => safe('add exclude to filter',
        async () => provider.ctrl.filter.addExclude(await normalizeExplorerPaths(uris)))),

    //main custom tree view

    vscode.commands.registerCommand(
      'sliceMaps.missingConfigWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('Set Up SliceMaps (workspace)',
        () => provider.ctrl.general.missingConfig(normalizeTreePaths(treeNode, provider.workspaceView.selection)))),

    vscode.commands.registerCommand(
      'sliceMaps.includeWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('include in map (workspace)',
        () => provider.ctrl.map.include(normalizeTreePaths(treeNode, provider.workspaceView.selection)))),

    vscode.commands.registerCommand(
      'sliceMaps.excludeWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('exclude from map (workspace)',
        () => provider.ctrl.map.exclude(normalizeTreePaths(treeNode, provider.workspaceView.selection)))),

    vscode.commands.registerCommand(
      'sliceMaps.removeExcludeFilterWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('remove exclude from filter (workspace)',
        () => provider.ctrl.filter.removeExclude(normalizeTreePaths(treeNode, provider.workspaceView.selection)))),

    vscode.commands.registerCommand(
      'sliceMaps.addExcludeFilterWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('add exclude to filter (workspace)',
        () => provider.ctrl.filter.addExclude(normalizeTreePaths(treeNode, provider.workspaceView.selection)))),

    //Maps

    vscode.commands.registerCommand(
      'sliceMaps.create', () => safe('create map',
        () => provider.ctrl.map.create())),

    vscode.commands.registerCommand(
      'sliceMaps.toggle', (map: SliceMap) => safe('toggle map',
        () => provider.ctrl.map.toggle(map))),

    vscode.commands.registerCommand(
      'sliceMaps.rename', (map: SliceMap) => safe('rename map',
        () => provider.ctrl.map.rename(map))),

    vscode.commands.registerCommand(
      'sliceMaps.delete', (map: SliceMap) => safe('delete map',
        () => provider.ctrl.map.remove(map))),

    vscode.commands.registerCommand(
      'sliceMaps.reset', (map: SliceMap) => safe('reset map',
        () => provider.ctrl.map.reset(map))),

    //Filter

    vscode.commands.registerCommand(
      'sliceMaps.createFilter', () => safe('create filter',
        () => provider.ctrl.filter.create())),

    vscode.commands.registerCommand(
      'sliceMaps.toggleFilter', (filter: SliceFilter) => safe('toggle filter',
        () => provider.ctrl.filter.toggle(filter))),

    vscode.commands.registerCommand(
      'sliceMaps.renameFilter', (filter: SliceFilter) => safe('rename filter',
        () => provider.ctrl.filter.rename(filter))),

    vscode.commands.registerCommand(
      'sliceMaps.deleteFilter', (filter: SliceFilter) => safe('delete filter',
        () => provider.ctrl.filter.remove(filter))),

    vscode.commands.registerCommand(
      'sliceMaps.resetFilter', (filter: SliceFilter) => safe('reset filter',
        () => provider.ctrl.filter.reset(filter))),

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