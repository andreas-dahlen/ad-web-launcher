import type { UUID } from 'node:crypto'

export type TreeNode = {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: TreeNode[]
}

export type SliceMap = {
  id: UUID
  name: string
  files: string[]
  folders: string[]
  names: string[]
  resolvedExclude: Map<string, boolean>
}

export type LoadedConfig = {
  tree: TreeNode
  folderExclude: Record<string, boolean>
  sliceMaps: SliceMap[]
}