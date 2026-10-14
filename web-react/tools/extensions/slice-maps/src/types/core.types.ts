import type { UUID } from 'node:crypto'
import * as vscode from 'vscode'
import type { LoadHandler } from '../loaders/loadHandler.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'
import type { AppStateCache } from '../cache/appStateCache.ts'

export type TreeNode = {
  path: string
  type: 'files' | 'folders'
  children?: TreeNode[]
}
type SliceTreeNode =
  | SliceMap
  | SliceFilter
  | { type: 'filterGroup' }
  | { type: 'mapGroup' }
  | { type: 'workspaceGroup' }

export type TreeProviderNode = SliceTreeNode | VisualTreeNode

export type VisualTreeNode = {
  path: string
  absolutePath: string
  children?: VisualTreeNode[]
  type: 'files' | 'folders'
  semantics?: NodeSemantics
}
export type NormalizedPaths = {
  includeFiles: string[]
  includeFolders: string[]
  excludeFiles: string[]
  excludeFolders: string[]
}

export type SliceMap = NormalizedPaths & {
  type: 'map'
  id: UUID
  name: string
}
export type SliceFilter = {
  type: 'filter'
  id: UUID
  name: string
  excludeFiles: string[]
  excludeFolders: string[]
}
export type Slice = SliceMap | SliceFilter

export type SliceData = {
  maps: SliceMap[]
  filters: SliceFilter[]
}

export type MergedSlice = NormalizedPaths & {
  mergeId: string
}

export type ActiveMap = {
  type: 'map'
  id: UUID
}

export type ActiveFilter = {
  type: 'filter'
  id: UUID
}

export type ActiveSlice = ActiveMap | ActiveFilter

export type ExcludeOrInclude = 'include' | 'exclude'

export type InharitedTruth = {
  implicit: ExcludeOrInclude
  explicit: ExcludeOrInclude | null
}

export type NodeSemantics = {
  type: 'explicit' | 'implicit'
  outcome: 'include' | 'exclude' | 'overwritten'
}

export type EffectiveResult = {
  resolution: Map<string, ExcludeOrInclude>
  semantics: Map<string, NodeSemantics>
  baseTruth: Map<string, InharitedTruth>
}


export type ResolvedExclusion = {
  result: EffectiveResult
  resolvedExclude: Record<string, true>
}
export type SliceResolution = MergedSlice & ResolvedExclusion

export type Scope = {
  loader: LoadHandler
  root: vscode.WorkspaceFolder
  cache: SliceCache
  output: vscode.OutputChannel
  appState: AppStateCache
  updateTree: () => void
  applyEffectiveSlice: () => Promise<void>
  resolveNothingActive: () => Promise<void>
}