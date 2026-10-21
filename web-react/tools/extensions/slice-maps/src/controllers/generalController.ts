import { cleanPerserved } from '../normalize/cleanPerserved.ts';
import normalizeGlob from '../normalize/glob.ts';
import { createFilter, createMap } from '../operations/create.ts';
import { deactivate } from '../operations/deactivate.ts';
import { requestGlob } from '../operations/glob.ts';
import { requestMapOrFilter } from '../operations/mapOrFilter.ts';
import { requestOperation } from '../operations/requestOperation.ts';
import type { GeneralControllerDeps } from '../types/controller.types.ts';
import type { Slice } from '../types/core.types.ts';

export function createGeneralController({
  appGet,
  conf,
  loadTree,
  ctrl,
  target,
  excluder,
  native,
  sliceCache,
  mergeCache,
  orchestrator,
  updateSliceTree,
}: GeneralControllerDeps
) {

  async function startup(): Promise<void> {
    const wasActive = native.getPersistedActiveState()
    if (wasActive) {
      const cachedExclude = native.getPersistedExclude()
      await deactivate(cachedExclude.local, target)
      await native.syncExclude()
    }
    await conf.resolveConfigIdentity()
    ctrl.tree.reset()
    updateSliceTree()
  }

  async function changeConfig(slice: Slice): Promise<void> {
    if (conf.getActiveConfig()?.id === slice.id) return

    const identity = {
      type: slice.type,
      id: slice.id
    }

    await conf.setActiveConfig(identity)

    updateSliceTree()
  }
  async function missingConfig(absolutePaths: string[]): Promise<void> {
    const type = await requestMapOrFilter()
    if (!type) return
    let identity
    if (type === 'map') {
      const map = await createMap()
      if (!map) return
      await sliceCache.addMap(map)
      identity = { id: map.id, type: map.type }
    } else if (type === 'filter') {
      const filter = await createFilter()
      if (!filter) return
      await sliceCache.addFilter(filter)
      identity = { id: filter.id, type: filter.type }
    } else { return }
    const operation = await requestOperation(identity)
    if (!operation) {
      await conf.resolveConfigIdentity()
      updateSliceTree()
      return
    }
    switch (operation) {
      case 'include':
        await ctrl.map.include(absolutePaths)
        break
      case 'exclude':
        await ctrl.map.exclude(absolutePaths)
        break
      case 'addExclude':
        await ctrl.filter.addExclude(absolutePaths)
        break
      case 'removeExclude':
        await ctrl.filter.removeExclude(absolutePaths)
        break
    }
  }

  async function addGlob(slice: Slice): Promise<void> {
    const pattern = await requestGlob()
    if (!pattern) return
    const total = native.getTotalExclude()
    if (!total) return

    const paths = normalizeGlob(pattern, loadTree.build(total))
    if (slice.type === 'map') {
      await ctrl.map.update(slice, paths)
    } else if (slice.type === 'filter') {
      await ctrl.filter.update(slice, paths, 'add')
    }
  }

  async function compressPreserved(slice: Slice): Promise<void> {
    const cleanedSlice = cleanPerserved(slice, mergeCache, excluder)

    if (!cleanedSlice) {
      throw new Error(`Failed to clean ${slice.type} "${slice.name}" (${slice.id})`)
    }

    let isActive: boolean

    if (cleanedSlice.type === 'map') {
      await sliceCache.addMap(cleanedSlice)
      isActive = appGet.isActiveMap(slice.id)
    } else {
      await sliceCache.addFilter(cleanedSlice)
      isActive = appGet.isActiveFilter(slice.id)
    }
    if (isActive) {
      await orchestrator.queRequest({
        type: cleanedSlice.type,
        id: slice.id,
        doesActivate: true
      })
    }
  }


  async function deactivateAll(): Promise<void> {
    await orchestrator.queRequest({
      type: 'resolve'
    })
  }

  return {
    startup,
    changeConfig,
    missingConfig,
    addGlob,
    compressPreserved,
    deactivateAll
  }
}