import * as vscode from 'vscode'

import type { TreeCounts, TreeMetadata, WorkspaceTreeNode } from '../types/core.types.ts'
import type { NodeSemantics } from '../types/exclusion.types.ts'

export function fileTreeItem(
  node: WorkspaceTreeNode,
  uri: vscode.Uri,
  { isOnlyFilterActive }: TreeMetadata
): vscode.TreeItem {

  const isFolder = node.type === 'folders'
  const name = node.path.split(/[\\/]/).pop() ?? node.path
  const semantics = node.semantics

  const item = new vscode.TreeItem(
    name,
    isFolder
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None,
  )

  if (!isFolder) {
    item.command = {
      command: 'vscode.open',
      title: 'Open File',
      arguments: [uri],
    }
  }

  item.resourceUri = uri
  item.id = uri.toString()
  item.contextValue = 'workspaceFile'

  item.label = `${getLabel(semantics, isFolder, isOnlyFilterActive)}   ${name} `

  item.description = `${getDescription(semantics, node.counts, isOnlyFilterActive)}`

  item.tooltip = new vscode.MarkdownString(getTooltip(semantics))
  return item
}

function getLabel(
  s: NodeSemantics | undefined,
  isFolder: boolean,
  isOnlyFilterActive: boolean
): string {
  if (!s) return ''

  if (s.type === 'implicit') {
    if (s.outcome === 'exclude') return `🔻`
    if (s.outcome === 'overwritten') return `🟡`
    if (isOnlyFilterActive) return '🔘'
    return `🌳`
  }

  if (isFolder) {
    if (s.outcome === 'exclude') return `🟥`
    if (s.outcome === 'overwritten') return `🟨`
    return `🟩`
  }

  if (s.outcome === 'exclude') return `🔴`
  return `🟢`


}

function getDescription(
  semantics: NodeSemantics | undefined,
  counts: TreeCounts,
  isOnlyFilterActive: boolean
): string {

  if (!semantics) return ''

  const totalIncl = counts.include.files + counts.include.folders
  const totalExcl = counts.exclude.files + counts.exclude.folders

  if ((totalIncl + totalExcl) === 0) return ''

  if (totalExcl === 0 && !isOnlyFilterActive) return `+${totalIncl}`
  if (totalIncl === 0) return `-${totalExcl}`

  if (isOnlyFilterActive) return ''
  return ` +${totalIncl} / -${totalExcl}`
}

function getTooltip(semantics: NodeSemantics | undefined) {
  if (!semantics) return 'Implicitly included'

  const { type, outcome } = semantics
  const isExplicit = type === 'explicit'
  const prefix = isExplicit ? 'Explicitly' : 'Implicitly'

  if (outcome === 'include') {
    return `${prefix} included`
  }

  if (outcome === 'exclude') {
    return `${prefix} excluded`
  }

  return `Excluded, but contains included descendants (${type})`
}