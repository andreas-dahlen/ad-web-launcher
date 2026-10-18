import * as vscode from 'vscode'
import { createSliceMapCache } from '../cache/sliceMapCache.ts'
import { deactivate } from '../operations/deactivate.ts'
import { loadHandler } from '../loaders/loadHandler.ts'
import { exclusionHandler } from '../exclusions/exclusionHandler.ts'
import { createSliceTreeProvider } from '../vscode/sliceTree.ts'
import { createAppStateCache } from '../cache/appStateCache.ts'
import type { Scope } from '../types/core.types.ts'
import { createMapController } from './mapController.ts'
import { createFilterController } from './filterController.ts'
import { activate } from '../operations/activate.ts'
import { createGeneralController } from './generalController.ts'
import { createTreeHandler } from './treeHandler.ts'
import { createTreeCache } from '../cache/treeCache.ts'
import { createWorkspaceTreeProvider } from '../vscode/workspaceTree.ts'
import { mergeSlice } from '../normalize/mergeSlice.ts'
import { createMergeCache } from '../cache/mergeCache.ts'

export type SliceProvider = NonNullable<ReturnType<typeof createSliceProvider>>
export function createSliceProvider(
  context: vscode.ExtensionContext,
  root: vscode.WorkspaceFolder,
  output: vscode.OutputChannel
) {

  const loader = loadHandler(context, root, output)

  const sliceCache = createSliceMapCache(loader)
  const appState = createAppStateCache()
  const mergeCache = createMergeCache()
  const treeCache = createTreeCache(appState)

  const excluder = exclusionHandler(loader, appState, mergeCache)


  const target = loader.getExcludeConfigTarget()

  const {
    sliceTreeProvider,
    sliceTreeDisposable,
    updateSliceTree
  } = createSliceTreeProvider(sliceCache, appState)

  const {
    workspaceTreeProvider,
    workspaceTreeDisposable,
    updateWorkspaceTree
  } = createWorkspaceTreeProvider(treeCache, output)

  const scope: Scope = {
    loader,
    root,
    sliceCache,
    output,
    appState,
    updateSliceTree,
    applyEffectiveSlice,
    resolveNothingActive
  }
  const tree = createTreeHandler(scope, treeCache, mergeCache)

  const map = createMapController(scope)
  const filter = createFilterController(scope)

  const general = createGeneralController(
    scope,
    map,
    filter,
    tree,
    excluder,
    mergeCache,
  )

  return {
    general,
    map,
    filter,
    tree,
    sliceTreeProvider,
    sliceTreeDisposable,
    workspaceTreeProvider,
    workspaceTreeDisposable,
  }
  async function applyEffectiveSlice(): Promise<void> {
    const localExclude = appState.getLocalExclude()
    if (!localExclude) {
      output.appendLine('[slice maps] error: localExclude is undefined')
      return
    }

    const slice = mergeSlice(sliceCache, appState)
    const exclude = excluder.resolve(slice, output)

    await activate(localExclude, exclude, target)
    tree.update(slice.mergeId)
    updateSliceTree()
    updateWorkspaceTree()
    general.updateTitle()
  }

  async function resolveNothingActive(): Promise<void> {
    const localExclude = appState.getLocalExclude()
    if (!localExclude) {
      output.appendLine('[slice maps] error: localExclude is undefined')
      return
    }

    await deactivate(localExclude, target)
    await loader.setPersistedExclude(undefined)
    tree.reset()
    updateSliceTree()
    updateWorkspaceTree()
    general.updateTitle()
  }
}