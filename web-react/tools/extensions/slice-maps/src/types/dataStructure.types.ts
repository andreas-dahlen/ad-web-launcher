import type { UUID } from 'node:crypto'
import * as vscode from 'vscode'

export type TreeNode = {
  name: string
  path: string
  type: PathContent
  children?: TreeNode[]
}

export type SliceMap = {
  id: UUID
  name: string
  files: string[]
  folders: string[]
  names: string[]
}

export type SliceMapResolution = SliceMap & {
  resolvedExclude: Map<string, boolean>
}

export type ExcludePackage = {
  configTarget: vscode.WorkspaceConfiguration
  resolvedExclude: Map<string, boolean>
}

export type AddContent = Exclude<keyof SliceMap, 'id'>
export type RemoveContent = Exclude<AddContent, "name">

export type PathContent = Exclude<RemoveContent, "names">

export type FormatPathResult = {
  value: string
  type: PathContent
}