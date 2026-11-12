import * as vscode from 'vscode'
import { createSliceMapCache } from '../cache/sliceMapCache.ts'
import { createLoadTree } from '../loaders/loadTree.ts'
import { exclusionHandler } from '../exclusions/exclusionHandler.ts'
import { createAppStateCache } from '../cache/appStateCache.ts'
import { createMapController } from '../controllers/mapController.ts'
import { createFilterController } from '../controllers/filterController.ts'
import { createGeneralController } from '../controllers/generalController.ts'
import { createTreeCache } from '../cache/treeCache.ts'
import { createMergeCache } from '../cache/mergeCache.ts'
import type { CompDeps, SharedDeps } from '../types/controller.types.ts'
import { createNativeBackupHandler } from './nativeBackupHandler.ts'
import { createSliceOrchestrator } from './sliceOrchestrator.ts'
import { setUpConfigCache } from '../identity/configIdentity.ts'
import { getExcludeConfigTarget, getSearchConfigTarget } from '../loaders/loadSettings.ts'
import { createStatusBar } from '../vscode/statusBar.ts'
import { createGlobHandler } from '../normalize/glob.ts'
import { createTreeController } from '../trees/treeController.ts'

export type SliceProvider = ReturnType<typeof createSliceProvider>
export function createSliceProvider(
  context: vscode.ExtensionContext,
  root: vscode.WorkspaceFolder
) {

  const { appGet, appSet } = createAppStateCache()
  const sliceCache = createSliceMapCache(context)
  const conf = setUpConfigCache(appGet, sliceCache, context)
  const treeCache = createTreeCache(appGet, conf)
  const mergeCache = createMergeCache()

  const native = createNativeBackupHandler(appGet, context, root)
  const loadTree = createLoadTree(root, native)
  const excluder = exclusionHandler(loadTree, mergeCache)
  const globber = createGlobHandler(loadTree)

  const { updateStatusBar, statusBar } = createStatusBar(context, appGet, sliceCache)

  const {
    tree,
    sliceMapsView,
    sliceMapsWorkspaceView,
    sliceTreeDisposable,
    workspaceView,
    workspaceTreeDisposable
  } = createTreeController({
    root,
    treeCache,
    mergeCache,
    loadTree,
    appGet,
    conf,
    sliceCache,
    excluder
  })

  const shared: SharedDeps = {
    sliceCache,
    mergeCache,
    excluder,
    native,
    target: getExcludeConfigTarget(root),
    searchTarget: getSearchConfigTarget(root),
    tree,
    updateStatusBar
  }

  const orchestrator = createSliceOrchestrator({
    ...shared,
    appGet,
    appSet
  })

  const compDeps: CompDeps = {
    root,
    appGet,
    conf,
    sliceCache,
    orchestrator,
    tree
  }

  const map = createMapController(compDeps)
  const filter = createFilterController({ ...compDeps, globber })

  const general = createGeneralController({
    ...shared,
    appGet,
    ctrl: { map, filter },
    conf,
    orchestrator,
    globber,
    treeCache
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