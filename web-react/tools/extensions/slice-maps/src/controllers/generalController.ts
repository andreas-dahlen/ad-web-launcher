import resolveGlob from '../exclude/resolveGlob.ts';
import { deactivate } from '../processing/deactivate.ts';
import { requestGlob } from '../processing/glob.ts';
import { requestOperation } from '../processing/requestOperation.ts';
import { requestSlice } from '../processing/requestSlice.ts';
import type { Scope, Slice } from '../types/dataStructure.types.ts';
import type { FilterController } from './createFilterController.ts';
import type { MapController } from './createMapController.ts';
import * as vscode from 'vscode'

export function createGeneralController(
  {
    loader,
    cache,
    output,
    treeChanged,
    appState
  }: Scope,
  map: MapController,
  filter: FilterController) {
  const target = loader.getExcludeConfigTarget()

  void output

  async function startup(): Promise<void> {
    const cachedLocalExclude = cache.getRecoveryExclude()
    if (!cachedLocalExclude) return

    await deactivate(cachedLocalExclude, target)
    await cache.setRecoveryExclude(undefined)
  }

  function toggleConfig(slice: Slice): void {
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

  async function explorerConfig(uris: vscode.Uri[]): Promise<void> {
    const identity = await requestSlice(cache.getMaps(), cache.getFilters())
    if (!identity) return
    appState.setActiveConfig(identity)
    const operation = await requestOperation(identity)
    if (!operation) return

    switch (operation) {
      case 'include':
        await map.include(uris)
        break
      case 'exclude':
        await map.exclude(uris)
        break
      case 'addExclude':
        await filter.addExclude(uris)
        break
      case 'removeExclude':
        await filter.removeExclude(uris)
        break
    }
  }

  async function addGlob(slice: Slice): Promise<void> {
    const pattern = await requestGlob()
    if (!pattern) return

    const paths = resolveGlob(pattern, loader.fileTree())
    if (slice.type === 'map') {
      await map.update(slice, paths, '[ADD] user adds')
    } else if (slice.type === 'filter') {
      await filter.update(slice, paths, '[EXCLUDE] user excludes')
    }
  }

  return {
    startup,
    toggleConfig,
    explorerConfig,
    addGlob
  }

  // async function resolveActiveIdentity(
  //   appState: AppStateCache,
  //   cache: SliceCache
  // ): Promise<UUID | undefined> {
  //   let identity = appState.getActiveConfig()
  //   if (identity) return identity.id

  //   const maps = cache.getMaps()
  //   const filters = cache.getFilters()

  //   if (maps.length === 1) {
  //     identity = { type: 'map', id: maps[0].id }
  //   } else {
  //     const newIdentity = await requestSlice(maps, filters)
  //     if (!newIdentity) return
  //     identity = newIdentity
  //   }
  //   appState.setActiveConfig(identity)
  //   return identity.id
  // }

  // async function resolveTarget(): Promise<Slice | undefined> {
  //   //TODO doesn't actually do anything currently... 
  //   // no clickable option avaiblable until an active config is active
  //   let identity = appState.getActiveConfig() ?? appState.getActiveMap() ?? appState.getActiveFilters()[0]

  //   const maps = cache.getMaps()
  //   const filters = cache.getFilters()

  //   if (!identity) {
  //     if (maps.length === 1) {
  //       identity = { type: 'map', id: maps[0].id }
  //     } else {
  //       const newIdentity = await requestSlice(maps, filters)
  //       if (!newIdentity) return
  //       identity = newIdentity
  //     }
  //     appState.setActiveConfig(identity)
  //     treeChanged.fire()
  //   }

  //   const slice = identity.type === 'map'
  //     ? cache.getMapById(identity.id)
  //     : cache.getFilterById(identity.id)
  //   if (!slice) return

  //   return slice
  // }

  // async function applyEffectiveSlice() {
  //   const localExclude = cache.getLocalExclude()
  //   if (!localExclude) {
  //     output.appendLine('[slice maps] error: localExclude is undefined')
  //     return
  //   }

  //   const slice = cache.getEffectiveSlice()
  //   const exclude = excluder.resolve(slice, output)

  //   await activate(localExclude, exclude, target)
  //   treeChanged.fire()
  // }

  // async function resolveNothingActive(): Promise<void> {
  //   const localExclude = cache.getLocalExclude()
  //   if (!localExclude) {
  //     output.appendLine('[slice maps] error: localExclude is undefined')
  //     return
  //   }

  //   await deactivate(localExclude, target)
  //   await cache.setRecoveryExclude(undefined)
  //   treeChanged.fire()
  // }
}