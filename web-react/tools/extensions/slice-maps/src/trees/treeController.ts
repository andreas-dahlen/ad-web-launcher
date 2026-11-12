import { createTreeHandler } from './treeHandler.ts'
import type { TreeControllerDeps } from '../types/controller.types.ts'
import { throwError } from '../utils/throwError.ts'
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


  function update() {
    const displayMode = treeCache.getDisplayMode()
    if (displayMode === 'effective') {
      if (appGet.hasActiveSlice()) {
        const mergeId = appGet.getActiveMergeId()
        treeHandler.updateEffectiveTree(mergeId)
      } else {
        treeHandler.resetEffectiveTree()
      }
    } else if (displayMode === 'configuration') {
      const activeConfSlice = conf.getActiveConfig()
      if (!activeConfSlice) throwError('active config is missing')
      treeHandler.updateConfigTree(activeConfSlice)
    }
    updateWorkspaceTitle()
    updateSliceTree()
    updateWorkspaceTree()
  }



  const tree = {
    update, // <-does updateWorkspaceTitle, does updateSliceTree, does updateWorkspaceTree
    // resetEffectiveTree, //<- updateWorkspaceTree, updateWorkspaceTitle, updateSliceTree 
    updateWorkspaceTitle,
    updateSliceTitle, // one explicit call site
    updateSliceTree // needed for quick updates
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