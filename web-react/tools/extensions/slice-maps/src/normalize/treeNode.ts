import type { TreeNode, WorkspaceTreeNode } from '../types/core.types.ts'
import * as vscode from 'vscode'
import type { NodeSemantics } from '../types/exclusion.types.ts'
export function enrichTree(
  nodes: TreeNode[],
  root: vscode.WorkspaceFolder,
  semanticData?: Map<string, NodeSemantics>
): WorkspaceTreeNode[] {

  function resolve(treeNodes: TreeNode[]): WorkspaceTreeNode[] {
    const tree: WorkspaceTreeNode[] = []

    for (const node of sortNodes(treeNodes)) {
      const absolutePath = vscode.Uri.joinPath(root.uri, node.path).fsPath
      const semantics = semanticData?.get(node.path)

      tree.push({
        ...node,
        absolutePath,
        semantics,
        children: node.children
          ? resolve(node.children)
          : undefined,
      })
    }
    return tree
  }
  return resolve(nodes)
}

function sortNodes(nodes: TreeNode[]): TreeNode[] {
  return nodes.toSorted((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'folders' ? -1 : 1
    }

    return getName(a.path).localeCompare(getName(b.path), undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  })
}

function getName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}