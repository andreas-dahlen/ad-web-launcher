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
import type { CompDeps, SharedDeps } from '../types/controller.types.ts'
import { createNativeBackupHandler } from './nativeBackupHandler.ts'
import { createSliceOrchestrator } from './sliceOrchestrator.ts'
import { setUpConfigCache } from '../identity/configIdentity.ts'
import { getExcludeConfigTarget } from '../loaders/loadSettings.ts'
import { createStatusBar } from '../vscode/statusBar.ts'
import { createGlobHandler } from '../normalize/glob.ts'

export type SliceProvider = ReturnType<typeof createSliceProvider>
export function createSliceProvider(
  context: vscode.ExtensionContext,
  root: vscode.WorkspaceFolder
) {

  const { appGet, appSet } = createAppStateCache()
  const sliceCache = createSliceMapCache(context)
  const conf = setUpConfigCache(appGet, sliceCache, context)
  const treeCache = createTreeCache(appGet)
  const mergeCache = createMergeCache()

  const native = createNativeBackupHandler(appGet, context, root)
  const loadTree = createLoadTree(root, native)
  const excluder = exclusionHandler(loadTree, mergeCache)
  const globber = createGlobHandler(loadTree)

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

  const { updateStatusBar, statusBar } = createStatusBar(context, appGet, sliceCache)

  const tree = createTreeHandler({
    root,
    treeCache,
    mergeCache,
    loadTree
  })

  const shared: SharedDeps = {
    sliceCache,
    mergeCache,
    excluder,
    native,
    target: getExcludeConfigTarget(root),
    updateSliceTree,
    updateStatusBar
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
  const filter = createFilterController({ ...compDeps, globber })

  const general = createGeneralController({
    ...shared,
    appGet,
    ctrl: { tree, map, filter },
    conf,
    orchestrator,
    globber
  })


  return {
    ctrl: { tree, map, filter, general },
    statusBar,
    sliceMapsView,
    sliceMapsWorkspaceView,
    workspaceView,
    sliceTreeDisposable,
    workspaceTreeDisposable,
  }
}