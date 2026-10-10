import * as vscode from 'vscode'
import { createSliceMapCache } from '../cache/sliceMapCache.ts'
import { deactivate } from '../operations/deactivate.ts'
import { loadHandler } from '../loaders/loadHandler.ts'
import { exclusionHandler } from '../exclusions/exclusionHandler.ts'
import { createTreeProvider } from '../vscode/tree.ts'
import { createAppStateCache } from '../cache/appStateCache.ts'
import type { Scope } from '../types/dataStructure.types.ts'
import { createMapController } from './mapController.ts'
import { createFilterController } from './filterController.ts'
import { activate } from '../operations/activate.ts'
import { createGeneralController } from './generalController.ts'
import { createVisualController } from './visualController.ts'
import { createVisualCache } from '../cache/visualCache.ts'

export type SliceProvider = NonNullable<ReturnType<typeof createSliceProvider>>
export function createSliceProvider(
  context: vscode.ExtensionContext,
  root: vscode.WorkspaceFolder,
  output: vscode.OutputChannel
) {

  const appState = createAppStateCache()
  const loader = loadHandler(context, root)
  const cache = createSliceMapCache(
    context, loader.sliceData(),
    appState, output
  )

  const visualCache = createVisualCache()
  const excluder = exclusionHandler(loader)
  const target = loader.getExcludeConfigTarget()

  const {
    treeProvider,
    treeDisposable,
    updateTree
  } = createTreeProvider(cache, appState, visualCache)

  const scope: Scope = {
    loader,
    root,
    cache,
    output,
    appState,
    updateTree,
    applyEffectiveSlice,
    resolveNothingActive
  }

  const map = createMapController(scope)
  const filter = createFilterController(scope)
  const visuals = createVisualController(scope, visualCache)

  const general = createGeneralController(
    scope,
    map,
    filter,
    visuals
  )

  return {
    general,
    map,
    filter,
    visuals,
    treeProvider,
    treeDisposable,
  }

  async function applyEffectiveSlice() {
    const localExclude = cache.getLocalExclude()
    if (!localExclude) {
      output.appendLine('[slice maps] error: localExclude is undefined')
      return
    }

    const slice = cache.getEffectiveSlice()
    const exclude = excluder.resolve(slice, output)

    await activate(localExclude, exclude, target)
    updateTree()
    visuals.update(slice.mergeId)
  }

  async function resolveNothingActive(): Promise<void> {
    const localExclude = cache.getLocalExclude()
    if (!localExclude) {
      output.appendLine('[slice maps] error: localExclude is undefined')
      return
    }

    await deactivate(localExclude, target)
    await cache.setRecoveryExclude(undefined)
    updateTree()
    visuals.clear()
  }
}