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

export type Slice = SliceMap | SliceFilter

export type SliceData = {
  maps: SliceMap[]
  filters: SliceFilter[]
}

export type SliceMap = {
  type: 'map'
  id: UUID
  name: string
  includeFiles: string[]
  includeFolders: string[]
  excludeFiles: string[]
  excludeFolders: string[]
}

export type SliceFilter = {
  type: 'filter'
  id: UUID
  name: string
  excludeFiles: string[]
  excludeFolders: string[]
  excludePatterns: string[]
}

export type MergedSlice = {
  mergeId: string
  includeFiles: string[]
  includeFolders: string[]
  excludeFiles: string[]
  excludeFolders: string[]
  // excludePatterns: string[]
}

export type NormalizedPaths = {
  includeFiles: string[]
  includeFolders: string[]
  excludeFiles: string[]
  excludeFolders: string[]
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


export type ResolvedTarget = {
  slice: Slice
  resolvedPaths: NormalizedPaths
}

// export type ExcludePackage = {
//   configTarget: vscode.WorkspaceConfiguration
//   resolvedExclude: Record<string, true>
// }

export type Scope = {
  loader: LoadHandler
  root: vscode.WorkspaceFolder
  cache: SliceCache
  output: vscode.OutputChannel
  treeChanged: vscode.EventEmitter<void>
  appState: AppStateCache
  applyEffectiveSlice: ApplyEffectiveSlice
  resolveNothingActive: ResolveNothingActive
  // add: Add
  // remove: Remove
}

// type ResolveTarget = (
//   uris: vscode.Uri[],
//   choice: UserChoice
// ) => Promise<ResolvedTarget | undefined>

type ApplyEffectiveSlice = () => Promise<void>
type ResolveNothingActive = () => Promise<void>
// type Add = (uris: vscode.Uri[]) => Promise<void>
// type Remove = (uris: vscode.Uri[]) => Promise<void>