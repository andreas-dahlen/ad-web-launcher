import type { ExclusionHandler } from '../exclusions/exclusionHandler.ts';
import { resolveConfigIdentity } from '../identity/configIdentity.ts';
import { cleanPerserved } from '../normalize/cleanPerserved.ts';
import normalizeGlob from '../normalize/glob.ts';
import { createFilter, createMap } from '../operations/create.ts';
import { deactivate } from '../operations/deactivate.ts';
import { requestGlob } from '../operations/glob.ts';
import { requestMapOrFilter } from '../operations/mapOrFilter.ts';
import { requestOperation } from '../operations/requestOperation.ts';
import type { Scope, Slice } from '../types/core.types.ts';
import type { FilterController } from './filterController.ts';
import type { MapController } from './mapController.ts';
import type { WorkspaceController } from './workspaceController.ts';

export function createGeneralController(
  {
    loader,
    cache,
    output,
    appState,
    updateSliceTree,
    root,
    applyEffectiveSlice
  }: Scope,
  map: MapController,
  filter: FilterController,
  visuals: WorkspaceController,
  excluder: ExclusionHandler
) {
  const target = loader.getExcludeConfigTarget()

  void output

  async function startup(): Promise<void> {
    const cachedExclude = loader.getPersistedExclude()
    if (cachedExclude) {
      await deactivate(cachedExclude.local, target)
      appState.setExcludes(cachedExclude)
      await loader.setPersistedExclude(undefined)
    } else {
      appState.setExcludes(loader.getFileExcludes())
    }
    await resolveConfigIdentity(appState, cache, loader)
    visuals.reset()
    updateSliceTree()
  }

  async function changeConfig(slice: Slice): Promise<void> {
    if (appState.getActiveConfig()?.id === slice.id) return

    const identity = {
      type: slice.type,
      id: slice.id
    }

    appState.setActiveConfig(identity)
    await loader.setPersistedActiveConfig(identity)

    updateSliceTree()
  }
  async function missingConfig(absolutePaths: string[]): Promise<void> {
    const type = await requestMapOrFilter()
    if (!type) return
    let identity
    if (type === 'map') {
      const map = await createMap(root)
      if (!map) return
      await cache.addMap(map)
      identity = { id: map.id, type: map.type }
    } else if (type === 'filter') {
      const filter = await createFilter(root)
      if (!filter) return
      await cache.addFilter(filter)
      identity = { id: filter.id, type: filter.type }
    } else { return }
    const operation = await requestOperation(identity)
    if (!operation) {
      await resolveConfigIdentity(appState, cache, loader)
      updateSliceTree()
      return
    }
    switch (operation) {
      case 'include':
        await map.include(absolutePaths)
        break
      case 'exclude':
        await map.exclude(absolutePaths)
        break
      case 'addExclude':
        await filter.addExclude(absolutePaths)
        break
      case 'removeExclude':
        await filter.removeExclude(absolutePaths)
        break
    }
  }

  async function addGlob(slice: Slice): Promise<void> {
    const pattern = await requestGlob()
    if (!pattern) return
    const total = appState.getTotalExclude()
    if (!total) return

    const paths = normalizeGlob(pattern, loader.fileTree(total))
    if (slice.type === 'map') {
      await map.update(slice, paths, '[ADD] user adds')
    } else if (slice.type === 'filter') {
      await filter.update(slice, paths, '[EXCLUDE] user excludes')
    }
  }

  async function compressPreserved(slice: Slice): Promise<void> {
    const cleanedSlice = cleanPerserved(slice, excluder, output)

    if (!cleanedSlice) {
      output.appendLine('error cleaning slice')
      return
    }

    let isActive: boolean

    if (cleanedSlice.type === 'map') {
      await cache.addMap(cleanedSlice)
      isActive = appState.isActiveMap(slice.id)
    } else {
      await cache.addFilter(cleanedSlice)
      isActive = appState.isActiveFilter(slice.id)
    }
    if (isActive) {
      await applyEffectiveSlice()
    }
  }

  return {
    startup,
    changeConfig,
    missingConfig,
    addGlob,
    compressPreserved
  }
}