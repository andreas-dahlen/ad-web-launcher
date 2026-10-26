import { activate, activateSearch } from '../operations/activate.ts';
import { mergeSlice } from '../normalize/mergeSlice.ts';
import type { OrchestratorDeps } from '../types/controller.types.ts';
import { deactivate, deactivateSearch } from '../operations/deactivate.ts';
import type { UUID } from 'node:crypto';
import { getBehavior, hasSearchSetting } from '../loaders/loadSettings.ts';
import type { NormalizedPaths } from '../types/core.types.ts';
import { cleanupChildExcludes } from '../cleanup/cleanChildExclude.ts';

export type SliceOrchestrator = NonNullable<ReturnType<typeof createSliceOrchestrator>>
export function createSliceOrchestrator({
  appGet,
  appSet,
  native,
  sliceViews,
  sliceCache,
  mergeCache,
  excluder,
  target,
  searchTarget,
  tree,
  updateSliceTree,
  updateWorkspaceTree,
  updateStatusBar
}: OrchestratorDeps
) {
  type QueItem =
    | {
      type: 'map' | 'filter'
      id: UUID
      doesActivate: boolean
      excludeCleanupInput?: string[]
    } | {
      type: 'resolve'
    }

  let isRunning = false
  const pending: QueItem[] = []

  async function queRequest(item: QueItem): Promise<void> {
    if (item.type === 'map' || item.type === 'filter') {
      const lookupIdx = pending.findIndex(queued =>
        queued.type === item.type && queued.id === item.id)

      if (lookupIdx === -1) {
        pending.push(item)
      } else {
        pending[lookupIdx] = item
      }
    } else pending.push(item)


    if (isRunning) return

    isRunning = true
    updateStatusBar({ isLoading: true })

    try {
      while (pending.length > 0) {
        const current = pending.shift()
        if (!current) continue

        await actionQue(current)
      }
    } finally {
      isRunning = false
      updateStatusBar({ isLoading: false })
    }
  }

  async function actionQue(item: QueItem): Promise<void> {
    const wasActive = appGet.hasActiveSlice()

    if (item.type === 'map') {

      if (item.doesActivate) {
        if (!wasActive) await native.syncExclude()
        appSet.setActiveMap({ type: 'map', id: item.id })
      } else {
        appSet.setActiveMap(undefined)
      }

    } else if (item.type === 'filter') {

      if (item.doesActivate) {
        if (!wasActive) await native.syncExclude()
        appSet.addActiveFilter(item.id)
      } else {
        appSet.removeActiveFilter(item.id)
      }
    } else {
      appSet.setActiveMap(undefined)
      appSet.clearActiveFilters()
    }

    await applyActiveState()
    await postRunCleanup(item)
    updateWorkspaceTree()
  }

  async function applyActiveState() {
    const localExclude = native.getLocalExclude()
    const localSearchExclude = native.getSearchExclude()
    if (appGet.hasActiveSlice()) {
      const slice = mergeSlice(sliceCache, appGet)
      const exclude = excluder.resolve(slice)
      await activate(localExclude, exclude, target)
      tree.update(slice.mergeId)

      if (hasSearchSetting()) {
        await activateSearch(localSearchExclude, exclude, searchTarget)
      }
    } else {
      await deactivate(localExclude, target)
      tree.reset()
      await deactivateSearch(localSearchExclude, searchTarget)
    }
    updateSliceTree()
    updateTitle()
    await native.syncActiveState()
  }

  async function postRunCleanup(item: QueItem) {
    if (item.type === 'resolve'
      || !item.excludeCleanupInput
      || item.excludeCleanupInput.length === 0
      || getBehavior() === 'preserve') return

    let result: NormalizedPaths | undefined
    if (item.type === 'map') {
      const map = sliceCache.getMapById(item.id)
      if (!map) return
      result = cleanupChildExcludes(map, mergeCache, excluder, item.excludeCleanupInput)
      if (!result) return
      await sliceCache.addMap({ ...map, ...result })
    } else {
      const filter = sliceCache.getFilterById(item.id)
      if (!filter) return
      result = cleanupChildExcludes(filter, mergeCache, excluder, item.excludeCleanupInput)
      if (!result) return
      await sliceCache.addFilter({ ...filter, ...result })
    }
    await applyActiveState()
  }

  function updateTitle() {
    const data = mergeCache.getDetails(appGet.getActiveMergeId())

    if (!data) {
      for (const view of sliceViews) view.title = 'Slice'
      return
    }

    let count = 0
    data.completeExclude.forEach(type => {
      if (type === 'exclude') count++
    })
    const title = `Slice · ${count} excluded`

    for (const view of sliceViews) {
      view.title = title
    }
  }


  return { queRequest }
}