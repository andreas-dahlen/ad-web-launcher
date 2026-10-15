import * as vscode from 'vscode'
import type { WorkspaceTreeNode } from '../types/core.types.ts'
import type { VisualCache } from '../cache/visualCache.ts'
import { fileTreeItem } from './fileTreeItem.ts'

export function createWorkspaceTreeProvider(
  visualCache: VisualCache,
  output: vscode.OutputChannel
): {
  workspaceTreeProvider: vscode.TreeDataProvider<WorkspaceTreeNode>
  updateWorkspaceTree: () => void
  workspaceTreeDisposable: vscode.Disposable
} {
  const workspaceTreeChanged = new vscode.EventEmitter<void>()

  const workspaceTreeProvider: vscode.TreeDataProvider<WorkspaceTreeNode> = {
    onDidChangeTreeData: workspaceTreeChanged.event,

    getChildren(node?: WorkspaceTreeNode): WorkspaceTreeNode[] {
      if (!node) {
        return visualCache.getActiveData() ?? []
      }

      if (node.type === 'folders') {
        return node.children ?? []
      }

      return []
    },

    getTreeItem(node: WorkspaceTreeNode): vscode.TreeItem {
      return fileTreeItem(
        node,
        vscode.Uri.file(node.absolutePath),
        output
      )
    }
  }

  return {
    workspaceTreeProvider,
    updateWorkspaceTree: () => workspaceTreeChanged.fire(),
    workspaceTreeDisposable: workspaceTreeChanged,
  }
}