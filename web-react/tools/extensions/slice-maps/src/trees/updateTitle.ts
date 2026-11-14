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

const getConfigName = (
  activeConfig: ActiveSlice,
  sliceCache: SliceCache
) => {
  return activeConfig.type === 'map'
    ? sliceCache.getMapById(activeConfig.id)?.name
    : sliceCache.getFilterById(activeConfig.id)?.name
}

const resolveEffective = (
  appGet: AppStateCache["appGet"],
  sliceCache: SliceCache
): string | null => {
  const activeMap = appGet.getActiveMap()
  const activeFilters = appGet.getActiveFilters()
  const filterCount = activeFilters.length
  if (!activeMap && filterCount === 0) return null
  const mapName = activeMap && sliceCache.getMapById(activeMap.id)?.name
  const filterName = filterCount === 1 && sliceCache.getFilterById(activeFilters[0].id)?.name

  if (mapName && filterCount > 0) return `${mapName} + ${filterCount}`
  if (mapName) return mapName
  if (filterName) return filterName
  if (filterCount > 1) return `${filterCount} filters`
  return null
}

export function updateWorkspaceT(
  displayMode: WorkspaceDisplayMode,
  activeConfig: ActiveSlice | undefined,
  appGet: AppStateCache["appGet"],
  view: TreeView<WorkspaceTreeNode>,
  sliceCache: SliceCache
) {
  const base = displayMode === 'effective' ? '🎯 Effective' : '🧩 Configuration'

  if (!activeConfig) {
    view.title = base
    return
  }

  if (displayMode === 'configuration') {
    const confName = getConfigName(activeConfig, sliceCache)
    if (!confName) {
      view.title = base
      return
    }
    view.title = `${base} · ${confName}`
    return
  }

  const activeMap = appGet.getActiveMap()
  const activeFilters = appGet.getActiveFilters().length

  const isActive = activeConfig.type === 'map'
    ? appGet.isActiveMap(activeConfig.id)
    : appGet.isActiveFilter(activeConfig.id)

  const name = resolveEffective(appGet, sliceCache)
  if (!name) {
    view.title = `${base}`
    return
  }

  if (isActive && activeMap && activeFilters > 0) {
    view.title = `${base} · ${name} 📚`
    return
  }

  if (isActive) {
    view.title = `${base} · ${name} ✅`
    return
  }

  view.title = `${base} · ${name} ⚠️`
}