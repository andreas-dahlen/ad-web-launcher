import type { UUID } from 'node:crypto'
import * as vscode from 'vscode'
import type { LoadHandler } from '../loaders/loadHandler.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'
import type { AppStateCache } from '../cache/appStateCache.ts'
import type { NodeSemantics } from './exclusion.types.ts'

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

export type WorkspaceTreeNode = {
  path: string
  absolutePath: string
  children?: WorkspaceTreeNode[]
  type: 'files' | 'folders'
  semantics?: NodeSemantics
}
export type NormalizedPaths = {
  includeFiles: string[]
  includeFolders: string[]
  excludeFiles: string[]
  excludeFolders: string[]
}

export type PathChoice = {
  action: ExcludeOrInclude
  files: Set<string>
  folders: Set<string>
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


export type Scope = {
  loader: LoadHandler
  root: vscode.WorkspaceFolder
  sliceCache: SliceCache
  output: vscode.OutputChannel
  appState: AppStateCache
  updateSliceTree: () => void
  applyEffectiveSlice: () => Promise<void>
  resolveNothingActive: () => Promise<void>
}