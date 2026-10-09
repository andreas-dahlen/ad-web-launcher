import * as vscode from 'vscode'
import { createSliceMapCache } from '../cache/sliceMapCache.ts'
import { deactivate } from '../processing/deactivate.ts'
import { loadHandler } from '../loaders/loadHandler.ts'
import { exclusionHandler } from '../exclude/exclusionHandler.ts'
import { createTreeProvider } from '../vscode/tree.ts'
import { createAppStateCache } from '../cache/appStateCache.ts'
import type { Scope } from '../types/dataStructure.types.ts'
import { createMapController } from '../controllers/createMapController.ts'
import { createFilterController } from '../controllers/createFilterController.ts'
import { activate } from '../processing/activate.ts'
import { createGeneralController } from '../controllers/generalController.ts'

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
  const excluder = exclusionHandler(loader)
  const target = loader.getExcludeConfigTarget()

  const { treeProvider, treeChanged } =
    createTreeProvider(cache, appState)

  const scope: Scope = {
    loader,
    root,
    cache,
    output,
    treeChanged,
    appState,
    applyEffectiveSlice,
    resolveNothingActive
  }

  const map = createMapController(scope)
  const filter = createFilterController(scope)
  const general = createGeneralController(
    scope,
    map,
    filter
  )

  return {
    map,
    filter,
    treeProvider,
    general
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
    treeChanged.fire()
  }

  async function resolveNothingActive(): Promise<void> {
    const localExclude = cache.getLocalExclude()
    if (!localExclude) {
      output.appendLine('[slice maps] error: localExclude is undefined')
      return
    }

    await deactivate(localExclude, target)
    await cache.setRecoveryExclude(undefined)
    treeChanged.fire()
  }
}