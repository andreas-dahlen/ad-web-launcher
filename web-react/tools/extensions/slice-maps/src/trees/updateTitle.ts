import type { TreeView } from 'vscode'
import type { ResolutionDetails } from '../types/exclusion.types.ts'
import type { ActiveSlice, SliceTreeNode, WorkspaceDisplayMode, WorkspaceTreeNode } from '../types/core.types.ts'
import type { AppStateCache } from '../cache/appStateCache.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'




export function updateSliceT(
  data: ResolutionDetails | undefined,
  views: TreeView<SliceTreeNode>[]
) {
  if (!data) {
    for (const view of views) view.title = 'Slice'
    return
  }
  let count = 0
  data.completeExclude.forEach(type => {
    if (type === 'exclude') count++
  })
  const title = `Slice · ${count} excluded`

  for (const view of views) {
    view.title = title
  }
}

const getName = (
  activeConfig: ActiveSlice | undefined,
  sliceCache: SliceCache
) => {
  return activeConfig === undefined
    ? null
    : (activeConfig.type === 'map'
      ? sliceCache.getMapById(activeConfig.id)?.name
      : sliceCache.getFilterById(activeConfig.id)?.name) ?? null
}

export function updateWorkspaceT(
  displayMode: WorkspaceDisplayMode,
  activeConfig: ActiveSlice | undefined,
  appGet: AppStateCache["appGet"],
  view: TreeView<WorkspaceTreeNode>,
  sliceCache: SliceCache
) {
  if (displayMode === 'configuration' && !activeConfig) {
    view.title = 'Configuration'
    return
  }
  const name = getName(activeConfig, sliceCache)

  const base = displayMode === 'effective' ? 'Effective' : 'Configuration'
  if (displayMode === 'configuration') {
    if (!activeConfig || !name) {
      view.title = `${base}`
      return
    }
    view.title = `${base} · ${name}`
    return
  }

  if (!activeConfig || !name) {
    view.title = `${base}`
    return
  }

  if (!appGet.hasActiveSlice()) {
    view.title = `${base} · ${name}`
    return
  }
  const activeMap = appGet.getActiveMap()
  const activeFilters = appGet.getActiveFilters().length

  const isActiveMap = appGet.isActiveMap(activeConfig.id)
  const isActiveFilter = appGet.isActiveFilter(activeConfig.id)

  if ((isActiveMap && activeFilters > 0)
    || (isActiveFilter && activeMap)) {
    view.title = `${base} · ${name} $(layers)`
    return
  }

  if (isActiveMap || isActiveFilter) {
    view.title = `${base} · ${name} $(check)`
    return
  }

  view.title = `${base} · ${name} $(warning)`
}