import type { UUID } from 'node:crypto'
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
  counts: TreeCounts
}

export type TreeCacheEntry = {
  nodeData: WorkspaceTreeNode[]
  sliceData?: NormalizedPaths
}


export type TreeCounts = {
  include: {
    files: number
    folders: number
  }
  exclude: {
    files: number
    folders: number
  }
}
export type NormalizedPaths = {
  includeFiles: string[]
  includeFolders: string[]
  excludeFiles: string[]
  excludeFolders: string[]
}

export type PathChoice = {
  action: ExcludeOrInclude | 'remove'
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
  // composition: 'map' | 'filter' | 'merged'
}

export type MapIdentity = {
  type: 'map'
  id: UUID
}

export type FilterIdentity = {
  type: 'filter'
  id: UUID
}

export type MergeIdentity = {
  type: 'merged'
  id: string
}

export type ActiveSlice = MapIdentity | FilterIdentity

export type ActiveIdentity = ActiveSlice | MergeIdentity

export type ActiveConfigChanged = {
  activeIdentity?: ActiveSlice
  requiresUpdate: boolean
}


export type ExcludeOrInclude = 'include' | 'exclude'

export type WorkspaceDisplayMode = "effective" | "configuration"