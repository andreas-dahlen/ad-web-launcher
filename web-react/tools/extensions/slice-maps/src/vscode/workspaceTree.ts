import * as vscode from 'vscode'
import type { WorkspaceTreeNode } from '../types/core.types.ts'
import type { TreeCache } from '../cache/treeCache.ts'
import { fileTreeItem } from './fileTreeItem.ts'

export function createWorkspaceTreeProvider(
  treeCache: TreeCache,
): {
  workspaceView: vscode.TreeView<WorkspaceTreeNode>
  updateWorkspaceTree: () => void
  workspaceTreeDisposable: vscode.Disposable
} {
  const workspaceTreeChanged = new vscode.EventEmitter<void>()
  const workspaceTreeProvider: vscode.TreeDataProvider<WorkspaceTreeNode> = {
    onDidChangeTreeData: workspaceTreeChanged.event,

    getChildren(node?: WorkspaceTreeNode): WorkspaceTreeNode[] {
      if (!node) {
        return treeCache.getActiveData() ?? []
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
      )
    }
  }
  const workspaceView = vscode.window.createTreeView('sliceWorkspace', {
    treeDataProvider: workspaceTreeProvider,
    canSelectMany: true
  })

  return {
    workspaceView,
    updateWorkspaceTree: () => workspaceTreeChanged.fire(),
    workspaceTreeDisposable: workspaceTreeChanged,
  }
}