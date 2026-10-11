import type { VisualCache } from '../cache/visualCache.ts';
import type { ExclusionHandler } from '../exclusions/exclusionHandler.ts';
import type { NodeSemantics, Scope, TreeNode, VisualTreeNode } from '../types/dataStructure.types.ts';
import * as vscode from 'vscode'

export type VisualController = NonNullable<ReturnType<typeof createVisualController>>
export function createVisualController(
  { updateTree, loader, root }: Scope,
  excluder: ExclusionHandler,
  visualCache: VisualCache
) {

  function setTreeView() {
    const tree = sortTree(loader.fileTree())
    const result = enrichTree(tree, root)
    visualCache.setData('inactive', result)
    visualCache.setRoot(root)
    updateTree()
  }

  async function update(mergeId: string) {
    const tree = sortTree(loader.fileTree())
    const data = excluder.getResolutionByMergeId(mergeId)
    if (!data) return

    const semantics = data.result.semantics

    const result = enrichTree(tree, root, semantics)

    visualCache.setData(mergeId, result)

    updateTree()
  }
  async function clear() {
    void visualCache
  }

  return {
    update,
    clear,
    setTreeView
  }
}

function enrichTree(
  nodes: TreeNode[],
  root: vscode.WorkspaceFolder,
  semantics?: Map<string, NodeSemantics>
): VisualTreeNode[] {
  return nodes.map(node => ({
    ...node,
    absolutePath: vscode.Uri.joinPath(root.uri, node.path).fsPath,
    semantics: semantics
      ? semantics.get(node.path)
      : undefined,
    children: node.children
      ? enrichTree(node.children, root, semantics)
      : undefined
  }))
}
function sortTree(fileTree: TreeNode[]): TreeNode[] {
  return fileTree
    .toSorted((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folders' ? -1 : 1
      }

      return getName(a.path).localeCompare(getName(b.path), undefined, {
        numeric: true,
        sensitivity: 'base',
      })
    })
    .map(node => ({
      ...node,
      ...(node.children && { children: sortTree(node.children) }),
    }))
}

function getName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}
