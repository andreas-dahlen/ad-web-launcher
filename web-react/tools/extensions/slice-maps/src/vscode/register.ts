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

  const sliceMapsView = vscode.window.createTreeView('sliceMaps', {
    treeDataProvider: provider.sliceTreeProvider
  })

  const workspaceView = vscode.window.createTreeView('sliceWorkspace', {
    treeDataProvider: provider.workspaceTreeProvider,
    canSelectMany: true
  })

  const sliceMapsWorkspaceView = vscode.window.createTreeView('sliceMapsWorkspace', {
    treeDataProvider: provider.sliceTreeProvider
  })

  provider.general.setSliceViews([sliceMapsView, sliceMapsWorkspaceView])

  context.subscriptions.push(
    sliceMapsView,
    workspaceView,
    sliceMapsWorkspaceView,
    provider.sliceTreeDisposable,
    //general

    vscode.commands.registerCommand(
      'sliceMaps.configure', (node: Slice) => safe('configure item',
        () => provider.general.changeConfig(node))),

    vscode.commands.registerCommand(
      'sliceMaps.glob', (node: Slice) => safe('glob item',
        () => provider.general.addGlob(node))),

    vscode.commands.registerCommand(
      'sliceMaps.compressPreserved', (node: Slice) => safe('compress preserved',
        () => provider.general.compressPreserved(node))),

    //main
    vscode.commands.registerCommand(
      'sliceMaps.missingConfig', (_, uris: vscode.Uri[]) => safe('Set Up SliceMaps',
        async () => provider.general.missingConfig(await normalizeExplorerPaths(uris)))),

    vscode.commands.registerCommand(
      'sliceMaps.include', (_, uris: vscode.Uri[]) => safe('include in map',
        async () => provider.map.include(await normalizeExplorerPaths(uris)))),

    vscode.commands.registerCommand(
      'sliceMaps.exclude', (_, uris: vscode.Uri[]) => safe('exclude from map',
        async () => provider.map.exclude(await normalizeExplorerPaths(uris)))),

    vscode.commands.registerCommand(
      'sliceMaps.removeExcludeFilter', (_, uris: vscode.Uri[]) => safe('remove exclude from filter',
        async () => provider.filter.removeExclude(await normalizeExplorerPaths(uris)))),

    vscode.commands.registerCommand(
      'sliceMaps.addExcludeFilter', (_, uris: vscode.Uri[]) => safe('add exclude to filter',
        async () => provider.filter.addExclude(await normalizeExplorerPaths(uris)))),

    //main custom tree view

    vscode.commands.registerCommand(
      'sliceMaps.missingConfigWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('Set Up SliceMaps (workspace)',
        () => provider.general.missingConfig(normalizeTreePaths(treeNode, workspaceView.selection)))),

    vscode.commands.registerCommand(
      'sliceMaps.includeWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('include in map (workspace)',
        () => provider.map.include(normalizeTreePaths(treeNode, workspaceView.selection)))),

    vscode.commands.registerCommand(
      'sliceMaps.excludeWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('exclude from map (workspace)',
        () => provider.map.exclude(normalizeTreePaths(treeNode, workspaceView.selection)))),

    vscode.commands.registerCommand(
      'sliceMaps.removeExcludeFilterWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('remove exclude from filter (workspace)',
        () => provider.filter.removeExclude(normalizeTreePaths(treeNode, workspaceView.selection)))),

    vscode.commands.registerCommand(
      'sliceMaps.addExcludeFilterWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('add exclude to filter (workspace)',
        () => provider.filter.addExclude(normalizeTreePaths(treeNode, workspaceView.selection)))),

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