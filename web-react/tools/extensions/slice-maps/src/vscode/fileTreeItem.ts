import * as vscode from 'vscode'

import type { TreeNode } from '../types/dataStructure.types.ts'

type VisualState =
  | 'explicitInclude'
  | 'implicitInclude'
  | 'explicitExclude'
  | 'implicitExclude'
  | 'excludedWithIncludedChildren'

const stateColors: Partial<Record<VisualState, string>> = {
  explicitInclude: 'charts.green',
  explicitExclude: 'charts.red',
  excludedWithIncludedChildren: 'charts.yellow',
}

const stateLabels: Record<VisualState, string> = {
  explicitInclude: '    +',
  implicitInclude: '    +',
  explicitExclude: '    -',
  implicitExclude: '    -',
  excludedWithIncludedChildren: '   ~',
}

const stateDescriptions: Record<VisualState, string> = {
  explicitInclude: '**Explicitly included**',
  implicitInclude: 'Implicitly included',
  explicitExclude: '**Explicitly excluded**',
  implicitExclude: 'Implicitly excluded',
  excludedWithIncludedChildren:
    '**Excluded** — contains included children',
}

export function fileTreeItem(
  node: TreeNode,
  uri: vscode.Uri,
  output: vscode.OutputChannel
): vscode.TreeItem {
  const isFolder = node.type === 'folders'
  const name = node.path.split(/[\\/]/).pop() ?? node.path

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

  // Temporary visual experiment
  const state = getTestState(name)

  item.description = getStateLabel(state)
  item.tooltip = new vscode.MarkdownString(stateDescriptions[state])
  output.appendLine(
    `[Visual] path=${node.path} | name=${name} | type=${node.type} | state=${state}`,
  )
  if (
    state === 'explicitInclude' ||
    state === 'explicitExclude' ||
    (state === 'excludedWithIncludedChildren' && isFolder)
  ) {
    item.iconPath = getStateIcon(state, isFolder)
  }

  output.appendLine(
    `[Icon] ${name} | ${item.iconPath ? 'custom icon assigned' : 'native icon'}`,
  )

  return item
}

function getTestState(name: string): VisualState {
  if (name === 'identity.ts') return 'explicitInclude'
  if (name === 'setup.utils.ts') return 'explicitExclude'
  if (name === 'operations') return 'excludedWithIncludedChildren'
  if (name === 'test') return 'implicitExclude'

  return 'implicitInclude'
}

function getStateIcon(
  state: VisualState,
  isFolder: boolean,
): vscode.ThemeIcon {
  const color = stateColors[state]

  if (!color) {
    throw new Error(`No icon color configured for state: ${state}`)
  }

  return new vscode.ThemeIcon(
    isFolder ? 'file-directory' : 'symbol-file',
    new vscode.ThemeColor(color),
  )
}

function getStateLabel(state: VisualState): string {
  return stateLabels[state]
}
