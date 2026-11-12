import * as vscode from 'vscode'
import type { AppStateCache } from '../cache/appStateCache.ts'
import type { LoadTree } from '../loaders/loadTree.ts'
import type { TreeCache } from '../cache/treeCache.ts'
import type { MergeCache } from '../cache/mergeCache.ts'
import type { MapController } from '../controllers/mapController.ts'
import type { FilterController } from '../controllers/filterController.ts'
import type { ExclusionHandler } from '../exclusions/exclusionHandler.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'
import type { NativeBackupHandler } from '../core/nativeBackupHandler.ts'
import type { SliceOrchestrator } from '../core/sliceOrchestrator.ts'
import type { ConfigCache } from '../identity/configIdentity.ts'
import type { StatusBarState } from './vscode.types.ts'
import type { GlobHandler } from '../normalize/glob.ts'
import type { TreeController } from '../trees/treeController.ts'

export type TreeHandlerDeps = {
  root: vscode.WorkspaceFolder
  loadTree: LoadTree
  treeCache: TreeCache
  mergeCache: MergeCache
  sliceCache: SliceCache
  excluder: ExclusionHandler
}

export type TreeControllerDeps = {
  root: vscode.WorkspaceFolder
  loadTree: LoadTree
  treeCache: TreeCache
  mergeCache: MergeCache
  appGet: AppStateCache["appGet"]
  conf: ConfigCache
  sliceCache: SliceCache
  excluder: ExclusionHandler
}
export type SharedDeps = {
  sliceCache: SliceCache
  mergeCache: MergeCache
  excluder: ExclusionHandler
  native: NativeBackupHandler
  target: vscode.WorkspaceConfiguration
  searchTarget: vscode.WorkspaceConfiguration
  tree: TreeController["tree"]
  updateStatusBar: (state: StatusBarState) => void
}

export type OrchestratorDeps = SharedDeps & {
  appGet: AppStateCache["appGet"]
  appSet: AppStateCache["appSet"]
}

export type CompDeps = {
  root: vscode.WorkspaceFolder
  appGet: AppStateCache["appGet"]
  conf: ConfigCache
  sliceCache: SliceCache
  orchestrator: SliceOrchestrator
  tree: TreeController["tree"]
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
  treeCache: TreeCache
}

type GeneralCtrlDeps = {
  map: MapController
  filter: FilterController
}