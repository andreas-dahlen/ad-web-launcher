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
export type SliceTreeNode =
  | SliceMap
  | SliceFilter
  | { type: 'filterGroup' }
  | { type: 'mapGroup' }
  | { type: 'workspaceGroup' }

export type TreeProviderNode = SliceTreeNode | VisualTreeNode

export type VisualTreeNode = {
  path: string
  children?: VisualTreeNode[]
  type: 'files' | 'folders'
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
export type NormalizedPaths = {
  includeFiles: string[]
  includeFolders: string[]
  excludeFiles: string[]
  excludeFolders: string[]
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

export type UserChoice = "include" | "exclude"
export type NodeState = "include" | "exclude"

export type SliceResolution = MergedSlice & {
  resolvedExclude: Record<string, true>
}

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