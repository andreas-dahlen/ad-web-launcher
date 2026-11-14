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

  context.subscriptions.push(
    provider.statusBar,
    provider.sliceMapsView,
    provider.sliceMapsWorkspaceView,
    provider.workspaceView,
    provider.sliceTreeDisposable,
    provider.workspaceTreeDisposable,
    //general


    vscode.commands.registerCommand(
      'sliceMaps.deactivateAllSlices', () => safe('deactivate all slices',
        () => provider.ctrl.general.deactivateAll())),
    vscode.commands.registerCommand(
      'sliceMaps.selectConfigSlice', (node: Slice) => safe('select config slice',
        () => provider.ctrl.general.changeConfig(node))),
    vscode.commands.registerCommand(
      'sliceMaps.compressRules', () => safe('compress active config',
        () => provider.ctrl.general.compress())),
    vscode.commands.registerCommand(
      'sliceMaps.toggleActiveConfigSlice', () => safe('toggle config target',
        () => provider.ctrl.general.toggleConfigTarget())),
    vscode.commands.registerCommand(
      'sliceMaps.addGlobExclusion', (node: Slice) => safe('glob item',
        () => provider.ctrl.general.addGlob(node))),
    vscode.commands.registerCommand(
      'sliceMaps.missingConfig', (_, uris: vscode.Uri[]) => safe('Set Up SliceMaps',
        async () => provider.ctrl.general.missingConfig(await normalizeExplorerPaths(uris)))),

    //Maps
    vscode.commands.registerCommand(
      'sliceMaps.toggleMap', (map: SliceMap) => safe('toggle map',
        () => provider.ctrl.map.toggle(map))),
    vscode.commands.registerCommand(
      'sliceMaps.includeMap', (_, uris: vscode.Uri[]) => safe('include in map',
        async () => provider.ctrl.map.include(await normalizeExplorerPaths(uris)))),
    vscode.commands.registerCommand(
      'sliceMaps.excludeMap', (_, uris: vscode.Uri[]) => safe('exclude from map',
        async () => provider.ctrl.map.exclude(await normalizeExplorerPaths(uris)))),
    vscode.commands.registerCommand(
      'sliceMaps.createMap', () => safe('create map',
        () => provider.ctrl.map.create())),
    vscode.commands.registerCommand(
      'sliceMaps.renameMap', (map: SliceMap) => safe('rename map',
        () => provider.ctrl.map.rename(map))),
    vscode.commands.registerCommand(
      'sliceMaps.deleteMap', (map: SliceMap) => safe('delete map',
        () => provider.ctrl.map.remove(map))),
    vscode.commands.registerCommand(
      'sliceMaps.resetMap', (map: SliceMap) => safe('reset map',
        () => provider.ctrl.map.reset(map))),

    //Filter

    vscode.commands.registerCommand(
      'sliceMaps.toggleFilter', (filter: SliceFilter) => safe('toggle filter',
        () => provider.ctrl.filter.toggle(filter))),
    vscode.commands.registerCommand(
      'sliceMaps.excludeFilter', (_, uris: vscode.Uri[]) => safe('add exclude to filter',
        async () => provider.ctrl.filter.addExclude(await normalizeExplorerPaths(uris)))),
    vscode.commands.registerCommand(
      'sliceMaps.excludeAllFilter', (_, uris: vscode.Uri[]) => safe('glob all',
        async () => provider.ctrl.filter.globAll(await normalizeExplorerPaths(uris)))),
    vscode.commands.registerCommand(
      'sliceMaps.createFilter', () => safe('create filter',
        () => provider.ctrl.filter.create())),
    vscode.commands.registerCommand(
      'sliceMaps.renameFilter', (filter: SliceFilter) => safe('rename filter',
        () => provider.ctrl.filter.rename(filter))),
    vscode.commands.registerCommand(
      'sliceMaps.deleteFilter', (filter: SliceFilter) => safe('delete filter',
        () => provider.ctrl.filter.remove(filter))),
    vscode.commands.registerCommand(
      'sliceMaps.resetFilter', (filter: SliceFilter) => safe('reset filter',
        () => provider.ctrl.filter.reset(filter))),

    //main custom tree view

    vscode.commands.registerCommand(
      'sliceMaps.changeDisplayModeWorkspace', () => safe('change display mode (workspace)',
        () => provider.ctrl.general.toggleDisplayMode())),
    vscode.commands.registerCommand(
      'sliceMaps.missingConfigWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('Set Up SliceMaps (workspace)',
        () => provider.ctrl.general.missingConfig(normalizeTreePaths(treeNode, provider.workspaceView.selection)))),

    vscode.commands.registerCommand(
      'sliceMaps.includeMapWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('include in map (workspace)',
        () => provider.ctrl.map.include(normalizeTreePaths(treeNode, provider.workspaceView.selection)))),
    vscode.commands.registerCommand(
      'sliceMaps.excludeMapWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('exclude from map (workspace)',
        () => provider.ctrl.map.exclude(normalizeTreePaths(treeNode, provider.workspaceView.selection)))),

    vscode.commands.registerCommand(
      'sliceMaps.excludeAllFilterWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('glob all (workspace)',
        () => provider.ctrl.filter.globAll(normalizeTreePaths(treeNode, provider.workspaceView.selection)))),
    vscode.commands.registerCommand(
      'sliceMaps.excludeFilterWorkspace', (treeNode: WorkspaceTreeNode) =>
      safe('add exclude to filter (workspace)',
        () => provider.ctrl.filter.addExclude(normalizeTreePaths(treeNode, provider.workspaceView.selection)))),

    //inline buttons

    vscode.commands.registerCommand(
      'sliceMaps.missingConfigWorkspaceItem', (treeNode: WorkspaceTreeNode) =>
      safe('Set Up SliceMaps (workspaceItem)',
        () => provider.ctrl.general.missingConfig(normalizeTreePaths(treeNode, [])))),

    vscode.commands.registerCommand(
      'sliceMaps.includeMapWorkspaceItem', (treeNode: WorkspaceTreeNode) =>
      safe('include in map (workspaceItem)',
        () => provider.ctrl.map.include(normalizeTreePaths(treeNode, [])))),
    vscode.commands.registerCommand(
      'sliceMaps.excludeMapWorkspaceItem', (treeNode: WorkspaceTreeNode) =>
      safe('exclude from map (workspaceItem)',
        () => provider.ctrl.map.exclude(normalizeTreePaths(treeNode, [])))),

    vscode.commands.registerCommand(
      'sliceMaps.excludeAllFilterWorkspaceItem', (treeNode: WorkspaceTreeNode) =>
      safe('glob all (workspaceItem)',
        () => provider.ctrl.filter.globAll(normalizeTreePaths(treeNode, [])))),
    vscode.commands.registerCommand(
      'sliceMaps.excludeFilterWorkspaceItem', (treeNode: WorkspaceTreeNode) =>
      safe('add exclude to filter (workspaceItem)',
        () => provider.ctrl.filter.addExclude(normalizeTreePaths(treeNode, [])))),


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