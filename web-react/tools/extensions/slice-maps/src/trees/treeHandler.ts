import type { UUID } from 'node:crypto';
import { isContentEqual } from '../exclusions/isContentEqual.ts';
import { enrichTree } from '../normalize/treeNode.ts';
import type { TreeHandlerDeps } from '../types/controller.types.ts';
import type { ActiveIdentity, ActiveSlice, MergedSlice, NormalizedPaths } from '../types/core.types.ts';
import type { CachedMergeData } from '../types/exclusion.types.ts';
import { throwError } from '../utils/throwError.ts';
export function createTreeHandler({
  root,
  loadTree,
  treeCache,
  mergeCache,
  sliceCache,
  excluder
}: TreeHandlerDeps
) {
  function updateCache(mergeId: string, mergeData: CachedMergeData) {
    const displayMode = treeCache.getDisplayMode()
    const tree = loadTree.build()
    const result = enrichTree(tree, root, mergeData.details)
    const data = {
      nodeData: result,
      sliceData: mergeData.sliceData
    }

    if (displayMode === 'effective') {
      treeCache.setSliceData(mergeId, data)
    } else if (displayMode === 'configuration') {
      treeCache.setConfigData(mergeId as UUID, data)
    }
  }

  function isTreeUpToDate({ type, id }: ActiveIdentity): boolean {
    const treeCachedSliceData = type === 'merged'
      ? treeCache.getSliceDataById(id)
      : treeCache.getConfigDataById(id as UUID)

    let cachedSliceData: NormalizedPaths

    switch (type) {
      case "merged": {
        const merger = mergeCache.getMergeSlice(id)
        if (!merger) return false
        const { mergeId, ...data } = merger
        cachedSliceData = data
        break
      }
      case "map": {
        const map = sliceCache.getMapById(id)
        if (!map) return false
        const { includeFiles, includeFolders,
          excludeFiles, excludeFolders } = map
        cachedSliceData = {
          includeFiles, includeFolders,
          excludeFiles, excludeFolders
        }
        break
      }
      case "filter": {
        const filter = sliceCache.getFilterById(id)
        if (!filter) return false
        const { excludeFiles, excludeFolders } = filter
        cachedSliceData = {
          excludeFiles, excludeFolders,
          includeFiles: [], includeFolders: []
        }
        break
      }
      default: return false
    }
    return Boolean(
      treeCachedSliceData &&
      isContentEqual(treeCachedSliceData, cachedSliceData)
    )
  }

  return {
    updateEffectiveTree(mergeId: string) {
      const mergeData = mergeCache.getCachedMergeData(mergeId)
      if (!mergeData || isTreeUpToDate({ id: mergeId, type: 'merged' })) return
      updateCache(mergeId, mergeData)
    }, //mergeData is updated before running in this case

    updateConfigTree(activeSlice: ActiveSlice) {
      let mergeData = mergeCache.getCachedMergeData(activeSlice.id)
      if (mergeData && isTreeUpToDate({ id: activeSlice.id, type: activeSlice.type })) return
      const slice = activeSlice.type === 'map'
        ? sliceCache.getMapById(activeSlice.id)
        : sliceCache.getFilterById(activeSlice.id)
      if (!slice) return
      const { id, type, name, ...rest } = slice
      const resolved = {
        includeFiles: [],
        includeFolders: [],
        ...rest,
        mergeId: id
      } satisfies MergedSlice
      excluder.resolve(resolved)
      mergeData = mergeCache.getCachedMergeData(activeSlice.id)
      if (!mergeData) throwError('updateConfigTree had undefined mergeData')
      updateCache(activeSlice.id, mergeData)
    },

    resetEffectiveTree() {
      const displayMode = treeCache.getDisplayMode()
      if (displayMode !== 'effective') return
      const tree = loadTree.build()
      const result = enrichTree(tree, root)
      treeCache.setSliceData('inactive', { nodeData: result })
    }
  }
}
