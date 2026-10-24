import * as vscode from 'vscode'
import type { AppStateCache } from '../cache/appStateCache.ts'
import type { LoadTree } from '../loaders/loadTree.ts'
import type { TreeCache } from '../cache/treeCache.ts'
import type { MergeCache } from '../cache/mergeCache.ts'
import type { TreeController } from '../core/treeHandler.ts'
import type { MapController } from '../controllers/mapController.ts'
import type { FilterController } from '../controllers/filterController.ts'
import type { ExclusionHandler } from '../exclusions/exclusionHandler.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'
import type { SliceTreeNode } from './core.types.ts'
import type { NativeBackupHandler } from '../core/nativeBackupHandler.ts'
import type { SliceOrchestrator } from '../core/sliceOrchestrator.ts'
import type { ConfigCache } from '../identity/configIdentity.ts'
import type { StatusBarState } from './vscode.types.ts'
import type { GlobHandler } from '../normalize/glob.ts'

export type TreeHandlerDeps = {
  root: vscode.WorkspaceFolder
  loadTree: LoadTree
  treeCache: TreeCache
  mergeCache: MergeCache
}
export type SharedDeps = {
  sliceCache: SliceCache
  mergeCache: MergeCache
  excluder: ExclusionHandler
  native: NativeBackupHandler
  target: vscode.WorkspaceConfiguration
  updateSliceTree: () => void
  updateStatusBar: (state: StatusBarState) => void
}

export type OrchestratorDeps = SharedDeps & {
  appGet: AppStateCache["appGet"]
  appSet: AppStateCache["appSet"]
  tree: TreeController
  sliceViews: vscode.TreeView<SliceTreeNode>[]
  updateWorkspaceTree: () => void
}

export type CompDeps = {
  root: vscode.WorkspaceFolder
  conf: ConfigCache
  appGet: AppStateCache["appGet"]
  sliceCache: SliceCache
  orchestrator: SliceOrchestrator
  updateSliceTree: () => void
}

export type FilterControllerDeps = CompDeps & {
  globber: GlobHandler
}

export type GeneralControllerDeps = SharedDeps & {
  appGet: AppStateCache["appGet"]
  ctrl: GeneralCtrlDeps
  conf: ConfigCache
  orchestrator: SliceOrchestrator
  globber: GlobHandler
}

type GeneralCtrlDeps = {
  tree: TreeController
  map: MapController
  filter: FilterController
}