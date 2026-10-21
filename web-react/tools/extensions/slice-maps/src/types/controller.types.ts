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
import type { UUID } from 'node:crypto'



export type OrchestratorDeps = {
  appGet: AppStateCache["appGet"]
  appSet: AppStateCache["appSet"]
  sliceViews: vscode.TreeView<SliceTreeNode>[]
  native: NativeBackupHandler
  sliceCache: SliceCache
  excluder: ExclusionHandler
  target: vscode.WorkspaceConfiguration
  mergeCache: MergeCache
  tree: TreeController
  updateSliceTree: () => void
  updateWorkspaceTree: () => void
}

export type QueItem =
  | {
    type: 'map' | 'filter'
    id: UUID
    doesActivate: boolean
  } | {
    type: 'resolve'
  }

type GeneralCtrlDeps = {
  tree: TreeController
  map: MapController
  filter: FilterController
}
export type CompDeps = {
  root: vscode.WorkspaceFolder
  conf: ConfigCache
  appGet: AppStateCache["appGet"]
  sliceCache: SliceCache
  orchestrator: SliceOrchestrator
  updateSliceTree: () => void
}
export type TreeHandlerDeps = {
  root: vscode.WorkspaceFolder
  loadTree: LoadTree
  treeCache: TreeCache
  mergeCache: MergeCache
  native: NativeBackupHandler
}
export type GeneralControllerDeps = {
  appGet: AppStateCache["appGet"]
  ctrl: GeneralCtrlDeps
  conf: ConfigCache
  loadTree: LoadTree
  target: vscode.WorkspaceConfiguration
  sliceCache: SliceCache
  orchestrator: SliceOrchestrator
  native: NativeBackupHandler
  excluder: ExclusionHandler
  mergeCache: MergeCache
  updateSliceTree: () => void
}
