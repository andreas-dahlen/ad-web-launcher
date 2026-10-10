import * as vscode from 'vscode'
import type { TreeNode } from '../types/dataStructure.types.ts'

export function fileTreeItem(
  node: TreeNode,
  uri: vscode.Uri,
): vscode.TreeItem {
  const isFolder = node.type === 'folders'

  const item = new vscode.TreeItem(
    node.path.split(/[\\/]/).pop() ?? node.path,
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

  return item
}