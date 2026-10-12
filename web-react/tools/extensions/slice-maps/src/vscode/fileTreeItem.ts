import * as vscode from 'vscode'

import type { NodeSemantics, VisualTreeNode } from '../types/dataStructure.types.ts'

export function fileTreeItem(
  node: VisualTreeNode,
  uri: vscode.Uri,
  output: vscode.OutputChannel
): vscode.TreeItem {

  void output //TODO remove output

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