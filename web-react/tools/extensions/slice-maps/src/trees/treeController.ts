import { createTreeHandler } from './treeHandler.ts'
import type { TreeControllerDeps } from '../types/controller.types.ts'
import { createSliceTreeProvider } from '../vscode/sliceTree.ts'
import { createWorkspaceTreeProvider } from '../vscode/workspaceTree.ts'
import { updateSliceT, updateWorkspaceT } from './updateTitle.ts'

export type TreeController = NonNullable<ReturnType<typeof createTreeController>>
export function createTreeController({
  treeCache,
  appGet,
  conf,
  sliceCache,
  root,
  loadTree,
  mergeCache,
  excluder,

}: TreeControllerDeps
) {
  const {
    sliceMapsView,
    sliceMapsWorkspaceView,
    sliceTreeDisposable,
    updateSliceTree
  } = createSliceTreeProvider(sliceCache, appGet, conf)
  const {
    workspaceView,
    workspaceTreeDisposable,
    updateWorkspaceTree
  } = createWorkspaceTreeProvider(treeCache)

  const treeHandler = createTreeHandler({
    root,
    loadTree,
    treeCache,
    mergeCache,
    sliceCache,
    excluder
  })

  const updateSliceTitle = () => updateSliceT(
    mergeCache.getDetails(appGet.getActiveMergeId()),
    [sliceMapsView, sliceMapsWorkspaceView]
  )

  const updateWorkspaceTitle = () => updateWorkspaceT(
    treeCache.getDisplayMode(),
    conf.getActiveConfig(),
    appGet,
    workspaceView,
    sliceCache
  )

  function updateTree() {
    updateWorkspaceTitle()
    updateSliceTree()
    updateWorkspaceTree()
  }

  function updateConfigMode() {
    const activeConfSlice = conf.getActiveConfig()
    if (activeConfSlice) {
      treeHandler.updateConfigTree(activeConfSlice)
    } else {
      treeHandler.resetConfigTree()
    }
    updateTree()
  }

  function updateEffectiveMode() {
    if (appGet.hasActiveSlice()) {
      const mergeId = appGet.getActiveMergeId()
      treeHandler.updateEffectiveTree(mergeId)
    } else {
      treeHandler.resetEffectiveTree()
    }
    updateTree()
  }

  function update() {
    const displayMode = treeCache.getDisplayMode()
    if (displayMode === 'effective') {
      updateEffectiveMode()
    } else if (displayMode === 'configuration') {
      updateConfigMode()
    }

    const isOnlyFiltersActive =
      !appGet.getActiveMap() && appGet.getActiveFilters().length > 0

    treeHandler.updateMetaData(isOnlyFiltersActive)
  }

  const tree = {
    update, // <-does updateWorkspaceTitle, does updateSliceTree, does updateWorkspaceTree
    // resetEffectiveTree, //<- updateWorkspaceTree, updateWorkspaceTitle, updateSliceTree 
    updateSliceTitle, // one explicit call site
    updateWorkspaceTitle, // needed for granular updates
    updateSliceTree // needed for granular updates
  }

  return {
    tree,
    sliceMapsView,
    sliceMapsWorkspaceView,
    sliceTreeDisposable,
    workspaceView,
    workspaceTreeDisposable,
  }
}