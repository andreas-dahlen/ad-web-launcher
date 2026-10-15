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
import { createWorkspaceController } from './workspaceController.ts'
import { createVisualCache } from '../cache/visualCache.ts'
import { createWorkspaceTreeProvider } from '../vscode/workspaceTree.ts'

export type SliceProvider = NonNullable<ReturnType<typeof createSliceProvider>>
export function createSliceProvider(
  context: vscode.ExtensionContext,
  root: vscode.WorkspaceFolder,
  output: vscode.OutputChannel
) {

  const appState = createAppStateCache()
  const loader = loadHandler(context, root, output)
  const cache = createSliceMapCache(loader, appState)

  const visualCache = createVisualCache()
  const excluder = exclusionHandler(loader, appState)
  const target = loader.getExcludeConfigTarget()

  const {
    sliceTreeProvider,
    sliceTreeDisposable,
    updateSliceTree
  } = createSliceTreeProvider(cache, appState)

  const {
    workspaceTreeProvider,
    workspaceTreeDisposable,
    updateWorkspaceTree
  } = createWorkspaceTreeProvider(visualCache, output)

  const scope: Scope = {
    loader,
    root,
    cache,
    output,
    appState,
    updateSliceTree,
    applyEffectiveSlice,
    resolveNothingActive
  }

  const map = createMapController(scope)
  const filter = createFilterController(scope)
  const visuals = createWorkspaceController(scope, excluder, visualCache)

  const general = createGeneralController(
    scope,
    map,
    filter,
    visuals,
    excluder
  )

  return {
    general,
    map,
    filter,
    visuals,
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

    const slice = cache.getEffectiveSlice()
    const exclude = excluder.resolve(slice, output)

    await activate(localExclude, exclude, target)
    visuals.update(slice.mergeId)
    updateSliceTree()
    updateWorkspaceTree()
  }

  async function resolveNothingActive(): Promise<void> {
    const localExclude = appState.getLocalExclude()
    if (!localExclude) {
      output.appendLine('[slice maps] error: localExclude is undefined')
      return
    }

    await deactivate(localExclude, target)
    await loader.setPersistedExclude(undefined)
    visuals.reset()
    updateSliceTree()
    updateWorkspaceTree()
  }
}