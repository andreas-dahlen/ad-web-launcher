import type { UUID } from 'node:crypto'
import * as vscode from 'vscode'

export type TreeNode = {
  path: string
  type: 'files' | 'folders'
  children?: TreeNode[]
}
export type ProcessedNode = {
  hasIncludedOverride: boolean
  state: 'included' | 'excluded'
}

export type SliceMap = {
  id: UUID
  name: string
  includeFiles: string[]
  includeFolders: string[]
  excludeFiles: string[]
  excludeFolders: string[]
}

export type UserChoice = "include" | "exclude"

export type SliceMapResolution = SliceMap & {
  resolvedExclude: Record<string, true>
}


export type ResolvedTargetMap = {
  map: SliceMap
  resolvedPath: FormatPathResult
}

export type ExcludePackage = {
  configTarget: vscode.WorkspaceConfiguration
  resolvedExclude: Record<string, true>
}

export type AddContent = Exclude<keyof SliceMap, 'id'>
export type RemoveContent = Exclude<AddContent, "name">


export type FormatPathResult = {
  value: string
  type: RemoveContent
}