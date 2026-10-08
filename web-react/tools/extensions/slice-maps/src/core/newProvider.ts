import * as vscode from 'vscode'
import { createSliceMapCache } from '../cache/sliceMapCache.ts'
import { deactivate } from '../processing/deactivate.ts'
import { loadHandler } from '../loaders/loadHandler.ts'
import { exclusionHandler } from '../exclude/exclusionHandler.ts'
import { createTreeProvider } from '../vscode/tree.ts'
import { createAppStateCache } from '../cache/appStateCache.ts'
import type { Scope, Slice } from '../types/dataStructure.types.ts'
import { requestSlice } from '../processing/request.ts'
import { resolvePaths } from '../utils/formatPath.ts'
import { createMapController } from '../controllers/createMapController.ts'
import { createFilterController } from '../controllers/createFilterController.ts'
import { activate } from '../processing/activate.ts'

export type SliceProvider = NonNullable<ReturnType<typeof createSliceProvider>>
export function createSliceProvider(
  context: vscode.ExtensionContext,
  root: vscode.WorkspaceFolder,
  output: vscode.OutputChannel
) {

  const appState = createAppStateCache()
  const loader = loadHandler(context, root)
  const cache = createSliceMapCache(
    context,
    loader.sliceData(),
    appState,
    output
  )
  const excluder = exclusionHandler(loader)
  const target = loader.getExcludeConfigTarget()

  const { treeProvider, treeChanged } = createTreeProvider(
    cache,
    appState
  )

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


  async function startup(): Promise<void> {
    const cachedLocalExclude = cache.getRecoveryExclude()
    if (!cachedLocalExclude) return

    await deactivate(cachedLocalExclude, target)
    await cache.setRecoveryExclude(undefined)
  }

  async function toggleConfig(slice: Slice): Promise<void> {
    if (appState.getActiveConfig()?.id === slice.id) {
      appState.setActiveConfig(undefined)
    } else {
      appState.setActiveConfig({
        type: slice.type,
        id: slice.id,
      })
    }

    treeChanged.fire()
  }

  async function include(uris: vscode.Uri[]): Promise<void> {
    const target = await resolveTarget()
    if (!target || target.type !== 'map') return

    // map only
    await map.addPathsToMap(
      target,
      resolvePaths(uris, root, 'include')
    )
  }

  async function exclude(uris: vscode.Uri[]): Promise<void> {
    const target = await resolveTarget()
    if (!target || target.type !== 'map') return

    // map only
    await map.removePathsFromMap(
      target,
      resolvePaths(uris, root, 'exclude')
    )
  }

  async function addExcludeFilter(uris: vscode.Uri[]): Promise<void> {
    const target = await resolveTarget()
    if (!target || target.type !== 'filter') return

    await filter.addPathsToFilter(
      target,
      resolvePaths(uris, root, 'exclude')
    )
  }

  async function removeExcludeFilter(uris: vscode.Uri[]): Promise<void> {
    const target = await resolveTarget()
    if (!target || target.type !== 'filter') return

    await filter.removePathsFromFilter(
      target,
      resolvePaths(uris, root, 'exclude')
    )
  }

  const map = createMapController(scope)
  const filter = createFilterController(scope)

  return {
    map,
    filter,
    treeProvider,
    startup,
    toggleConfig,
    exclude,
    include,
    addExcludeFilter,
    removeExcludeFilter
  }

  async function resolveTarget(): Promise<Slice | undefined> {
    let identity = appState.getActiveConfig() ?? appState.getActiveMap() ?? appState.getActiveFilters()[0]

    const maps = cache.getMaps()
    const filters = cache.getFilters()

    if (!identity) {
      if (maps.length === 1) {
        identity = { type: 'map', id: maps[0].id }
      } else {
        const newIdentity = await requestSlice(maps, filters)
        if (!newIdentity) return
        identity = newIdentity
      }
      appState.setActiveConfig(identity)
      treeChanged.fire()
    }

    const slice = identity.type === 'map'
      ? cache.getMapById(identity.id)
      : cache.getFilterById(identity.id)
    if (!slice) return

    return slice
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