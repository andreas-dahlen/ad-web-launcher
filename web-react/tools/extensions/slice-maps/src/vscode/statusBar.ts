import * as vscode from 'vscode'
import type { StatusBarState } from '../types/vscode.types.ts'
import type { AppStateCache } from '../cache/appStateCache.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'
import type { ActiveFilter, ActiveMap } from '../types/core.types.ts'

export function createStatusBar(
  context: vscode.ExtensionContext,
  appGet: AppStateCache["appGet"],
  sliceCache: SliceCache
) {
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
  )
  context.subscriptions.push(statusBar)
  statusBar.text = '$(sync~spin) Slice Maps'
  statusBar.tooltip = 'Slice Maps: Extension loading...'

  statusBar.show()

  let activeName: string
  let activeType: ActiveType | undefined

  type LoadingState = {
    isLoading: boolean
  }

  function updateStatusBar(state: LoadingState): void {

    if (state.isLoading) {
      update(state)
      return
    }
    activeType = getType(appGet)
    activeName = getName(sliceCache, activeType)

    if (!activeType) {
      update({ isLoading: false })
      return
    }
    update({
      isLoading: false,
      activeType: activeType.type,
      activeName
    })
  }



  function update(
    state: StatusBarState,
  ): void {
    if (state.isLoading) {
      statusBar.text = '$(sync~spin) Slice Maps'
      statusBar.tooltip = 'Slice Maps: Applying changes...'
      statusBar.command = undefined
      return
    }

    if (state.activeName && state.activeType) {
      const icon = {
        Map: '$(layers)',
        Filter: '$(filter)',
        Slice: '$(layers)',
      }[state.activeType]

      statusBar.text = `${icon} Slice Maps: ${state.activeName}`
      statusBar.tooltip = `Slice Maps: Active ${state.activeType}`
      statusBar.command = 'sliceMaps.deactivateAll'
      return
    }

    statusBar.text = '$(circle-slash) Slice Maps'
    statusBar.tooltip = 'Slice Maps: Inactive'
    statusBar.command = 'sliceMaps.toggleOnActiveConfig'
  }
  return {
    updateStatusBar,
    statusBar
  }
}


type ActiveType =
  | {
    type: 'Slice'
    activeMap: ActiveMap
    activeFilters: ActiveFilter[]
  } | {
    type: 'Map'
    activeMap: ActiveMap
  } | {
    type: 'Filter'
    activeFilters: ActiveFilter[]
  }

function getType(appGet: AppStateCache["appGet"]): ActiveType | undefined {
  if (appGet.getActiveMergeId() === 'inactive') return
  const activeMap = appGet.getActiveMap()
  const activeFilters = appGet.getActiveFilters()

  if (activeMap && activeFilters.length > 0) {
    return { type: 'Slice', activeFilters, activeMap }
  }
  if (activeMap) return { type: 'Map', activeMap }
  if (activeFilters.length > 0) return { type: 'Filter', activeFilters }
}

function getName(
  sliceCache: SliceCache,
  activeType: ActiveType | undefined): string {

  if (!activeType) return ''

  if (activeType.type === 'Slice') {
    const mapName = truncate(
      sliceCache.getMapById(activeType.activeMap.id)?.name
      ?? 'unknown', 8
    )
    const length = activeType.activeFilters.length

    const suffix = length > 1 ? 'filters' : 'filter'
    return `${mapName} + ${length} ${suffix}`

  }

  if (activeType.type === 'Map') {
    return truncate(
      sliceCache.getMapById(activeType.activeMap.id)?.name
      ?? 'unknown', 12
    )
  }

  if (activeType.type === 'Filter') {
    if (activeType.activeFilters.length === 1) {
      return truncate(
        sliceCache.getFilterById(activeType.activeFilters[0].id)?.name
        ?? 'unknown', 12
      )
    }
    return `${activeType.activeFilters.length} filters`
  }
  return ''
}

function truncate(text: string, max: number): string {
  return text.length > max
    ? `${text.slice(0, max - 3)}...`
    : text
}