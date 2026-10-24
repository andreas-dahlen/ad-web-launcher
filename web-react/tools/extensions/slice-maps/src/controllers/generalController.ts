import { cleanSlice } from '../normalize/cleanSlice.ts';
import { createFilter, createMap } from '../operations/create.ts';
import { deactivate } from '../operations/deactivate.ts';
import { requestGlob } from '../operations/glob.ts';
import { requestMapOrFilter } from '../operations/mapOrFilter.ts';
import { requestOperation } from '../operations/requestOperation.ts';
import type { GeneralControllerDeps } from '../types/controller.types.ts';
import type { ActiveSlice, Slice } from '../types/core.types.ts';
import { throwError } from '../utils/throwError.ts';

export function createGeneralController({
  appGet,
  conf,
  ctrl,
  target,
  excluder,
  native,
  sliceCache,
  mergeCache,
  globber,
  orchestrator,
  updateSliceTree,
  updateStatusBar
}: GeneralControllerDeps
) {

  async function startup(): Promise<void> {
    const wasActive = native.getPersistedActiveState()
    if (wasActive) {
      const cachedExclude = native.getPersistedExclude()
      await deactivate(cachedExclude.local, target)
    }
    await native.syncExclude()
    await conf.resolveConfigIdentity()
    ctrl.tree.reset()
    updateSliceTree()
    updateStatusBar({ isLoading: false })
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

  async function toggleConfigTarget(): Promise<void> {
    const mergeId = appGet.getActiveMergeId()
    if (mergeId !== 'inactive') throwError(`A map or filter is already active ${mergeId}`)

    const identity = await conf.resolveConfigIdentity()
    if (!identity) throwError('No map or filter available.')

    if (identity.type === 'map') {
      const map = sliceCache.getMapById(identity.id)
      if (!map) throwError('The active config map could not be found.')

      await ctrl.map.toggle(map)
      return
    }
    const filter = sliceCache.getFilterById(identity.id)
    if (!filter) throwError('The active config filter could not be found.')

    await ctrl.filter.toggle(filter)
  }

  async function missingConfig(absolutePaths: string[]): Promise<void> {
    const type = await requestMapOrFilter()
    if (!type) return
    let identity: ActiveSlice
    if (type === 'map') {
      const map = await createMap()
      if (!map) return
      await sliceCache.addMap(map)
      identity = { id: map.id, type: map.type }
    } else {
      const filter = await createFilter()
      if (!filter) return
      await sliceCache.addFilter(filter)
      identity = { id: filter.id, type: filter.type }
    }

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
      case 'excludeAll':
        await ctrl.filter.globAll(absolutePaths)
        break
    }
  }

  async function addGlob(slice: Slice): Promise<void> {
    const pattern = await requestGlob()
    if (!pattern) return

    const paths = globber.globSingle(pattern)
    if (slice.type === 'map') {
      await ctrl.map.update(slice, paths)
    } else if (slice.type === 'filter') {
      await ctrl.filter.update(slice, paths)
    }
  }

  async function compress(): Promise<void> {
    const activeConfig = conf.getActiveConfig()
    if (!activeConfig) throwError('No active configuration found.')
    const slice = activeConfig.type === 'map'
      ? sliceCache.getMapById(activeConfig.id)
      : sliceCache.getFilterById(activeConfig.id)
    if (!slice) throwError('The active configuration Slice could not be found.')

    const cleanedSlice = cleanSlice(slice, mergeCache, excluder)

    if (!cleanedSlice) return

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
    toggleConfigTarget,
    changeConfig,
    missingConfig,
    addGlob,
    compress,
    deactivateAll
  }
}