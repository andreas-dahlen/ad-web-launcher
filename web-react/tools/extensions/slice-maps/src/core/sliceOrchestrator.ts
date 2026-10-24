import { activate } from '../operations/activate.ts';
import { mergeSlice } from '../normalize/mergeSlice.ts';
import type { OrchestratorDeps } from '../types/controller.types.ts';
import { deactivate } from '../operations/deactivate.ts';
import type { UUID } from 'node:crypto';

type QueItem =
  | {
    type: 'map' | 'filter'
    id: UUID
    doesActivate: boolean
  } | {
    type: 'resolve'
  }
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
  tree,
  updateSliceTree,
  updateWorkspaceTree,
  updateStatusBar
}: OrchestratorDeps
) {

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
    await native.syncActiveState()
  }

  async function applyActiveState() {
    const localExclude = native.getLocalExclude()
    if (appGet.hasActiveSlice()) {
      const slice = mergeSlice(sliceCache, appGet)
      const exclude = excluder.resolve(slice)
      await activate(localExclude, exclude, target)
      tree.update(slice.mergeId)
    } else {
      await deactivate(localExclude, target)
      tree.reset()
    }
    updateSliceTree()
    updateWorkspaceTree()
    updateTitle()
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