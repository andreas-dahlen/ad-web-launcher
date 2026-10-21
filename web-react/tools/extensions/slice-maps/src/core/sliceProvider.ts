import * as vscode from 'vscode'
import { createSliceMapCache } from '../cache/sliceMapCache.ts'
import { createLoadTree } from '../loaders/loadTree.ts'
import { exclusionHandler } from '../exclusions/exclusionHandler.ts'
import { createSliceTreeProvider } from '../vscode/sliceTree.ts'
import { createAppStateCache } from '../cache/appStateCache.ts'
import { createMapController } from '../controllers/mapController.ts'
import { createFilterController } from '../controllers/filterController.ts'
import { createGeneralController } from '../controllers/generalController.ts'
import { createTreeHandler } from './treeHandler.ts'
import { createTreeCache } from '../cache/treeCache.ts'
import { createWorkspaceTreeProvider } from '../vscode/workspaceTree.ts'
import { createMergeCache } from '../cache/mergeCache.ts'
import type { CompDeps } from '../types/controller.types.ts'
import { createNativeBackupHandler } from './nativeBackupHandler.ts'
import { createSliceOrchestrator } from './sliceOrchestrator.ts'
import { setUpConfigCache } from '../identity/configIdentity.ts'
import { getExcludeConfigTarget } from '../loaders/loadSettings.ts'

export type SliceProvider = ReturnType<typeof createSliceProvider>
export function createSliceProvider(
  context: vscode.ExtensionContext,
  root: vscode.WorkspaceFolder
) {

  const loadTree = createLoadTree(root)
  const sliceCache = createSliceMapCache(context)
  const { appGet, appSet } = createAppStateCache()

  const conf = setUpConfigCache(appGet, sliceCache, context)
  const treeCache = createTreeCache(appGet)
  const mergeCache = createMergeCache()

  const native = createNativeBackupHandler(appGet, context, root)
  const excluder = exclusionHandler(loadTree, native, mergeCache)

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

  const tree = createTreeHandler({
    root,
    treeCache,
    mergeCache,
    native,
    loadTree
  })

  const shared = {
    sliceCache,
    mergeCache,
    excluder,
    native,
    target: getExcludeConfigTarget(root),
    updateSliceTree
  }

  const orchestrator = createSliceOrchestrator({
    ...shared,
    appGet,
    appSet,
    tree,
    sliceViews: [sliceMapsView, sliceMapsWorkspaceView],
    updateWorkspaceTree
  })

  const compDeps: CompDeps = {
    root,
    appGet,
    conf,
    sliceCache,
    orchestrator,
    updateSliceTree
  }

  const map = createMapController(compDeps)
  const filter = createFilterController(compDeps)

  const general = createGeneralController({
    ...shared,
    appGet,
    ctrl: { tree, map, filter },
    conf,
    loadTree,
    orchestrator
  })


  return {
    ctrl: { tree, map, filter, general },
    sliceMapsView,
    sliceMapsWorkspaceView,
    workspaceView,
    sliceTreeDisposable,
    workspaceTreeDisposable,
  }
}