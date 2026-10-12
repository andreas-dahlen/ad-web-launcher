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

  item.description = getLabel(semantics?.outcome)
  item.tooltip = new vscode.MarkdownString(getTooltip(semantics))

  if (semantics?.type === 'explicit') {
    const icon = getStateIcon(semantics.outcome, isFolder)
    item.iconPath = icon
  }

  return item
}

function getStateIcon(
  outcome: NodeSemantics['outcome'],
  isFolder: boolean,
): vscode.ThemeIcon {
  let color: string = 'charts.green'
  if (outcome === 'overwritten') color = 'charts.yellow'
  else if (outcome === 'exclude') color = 'charts.red'

  return new vscode.ThemeIcon(
    isFolder ? 'file-directory' : 'symbol-file',
    new vscode.ThemeColor(color),
  )
}

function getLabel(outcome: NodeSemantics['outcome'] | undefined) {
  if (outcome === 'exclude') return '-'
  if (outcome === 'overwritten') return '~'
  return '+'
}

function getTooltip(semantics: NodeSemantics | undefined) {

  if (!semantics) return 'Implicitly included'

  if (semantics.type === 'explicit') {
    if (semantics.outcome === 'include') return '**Explicitly included**'
    if (semantics.outcome === 'overwritten') return '**Excluded** — explicitly but contains included children'
    return '**Explicitly excluded**'
  }
  if (semantics.type === 'implicit') {
    if (semantics.outcome === 'exclude') return 'Implicitly excluded'
    if (semantics.outcome === 'overwritten') return '**Excluded** — inplicitly but contains included children'
  }
  return 'Implicitly included'
}