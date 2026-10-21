import * as vscode from 'vscode'

import type { WorkspaceTreeNode } from '../types/core.types.ts'
import type { NodeSemantics } from '../types/exclusion.types.ts'

export function fileTreeItem(
  node: WorkspaceTreeNode,
  uri: vscode.Uri,
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

  item.label = `${getLabel(semantics, isFolder)}   ${name} `

  // item.description = getLabel(semantics?.outcome, item.label)
  item.tooltip = new vscode.MarkdownString(getTooltip(semantics))
  return item
}

function getLabel(
  s: NodeSemantics | undefined,
  isFolder: boolean
): string {
  if (!s) return ''

  if (s.type === 'implicit') {
    if (s.outcome === 'exclude') return `🔻`
    if (s.outcome === 'overwritten') return `🧈`
    return `🌲`
  }

  if (isFolder) {
    if (s.outcome === 'exclude') return `🟥`
    if (s.outcome === 'overwritten') return `🟨`
    return `🟩`
  }

  if (s.outcome === 'exclude') return `🔴`
  if (s.outcome === 'overwritten') return `🟡`
  return `🟢`


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