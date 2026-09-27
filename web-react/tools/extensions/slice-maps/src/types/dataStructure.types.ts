
export type TreeNode = {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: TreeNode[]
}

export type SliceMap = {
  id: string
  name: string
  files: string[]
  folders: string[]
  names: string[]
}

export type LoadedConfig = {
  tree: TreeNode
  folderExclude: Record<string, boolean>
  sliceMaps: SliceMap[]
}