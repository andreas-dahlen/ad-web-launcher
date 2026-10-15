import type { VisualCache } from '../cache/visualCache.ts';
import type { ExclusionHandler } from '../exclusions/exclusionHandler.ts';
import type { NodeSemantics, Scope, TreeNode, WorkspaceTreeNode } from '../types/core.types.ts';
import * as vscode from 'vscode'

export type WorkspaceController = NonNullable<ReturnType<typeof createWorkspaceController>>
export function createWorkspaceController(
  { loader, root, appState }: Scope,
  excluder: ExclusionHandler,
  visualCache: VisualCache
) {

  function update(mergeId: string) {
    const total = appState.getTotalExclude()
    if (!total) return
    const tree = loader.fileTree(total)
    const data = excluder.getResolutionByMergeId(mergeId)
    if (!data) return

    const semantics = data.result.semantics

    const result = enrichTree(tree, root, semantics)

    visualCache.setData(mergeId, result)
    visualCache.setActive(mergeId)
  }

  function reset() {
    const total = appState.getTotalExclude()
    if (!total) return
    const tree = loader.fileTree(total)
    const result = enrichTree(tree, root)
    visualCache.setData('inactive', result)
    visualCache.setActive('inactive')
  }

  return {
    update,
    reset
  }
}


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