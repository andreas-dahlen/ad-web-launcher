import type { TreeNode, WorkspaceTreeNode } from '../types/core.types.ts'
import * as vscode from 'vscode'
import type { ResolutionDetails } from '../types/exclusion.types.ts'
export function enrichTree(
  nodes: TreeNode[],
  root: vscode.WorkspaceFolder,
  details?: ResolutionDetails
): WorkspaceTreeNode[] {

  function resolve(treeNodes: TreeNode[]): WorkspaceTreeNode[] {
    const tree: WorkspaceTreeNode[] = []

    for (const node of sortNodes(treeNodes)) {
      const absolutePath = vscode.Uri.joinPath(root.uri, node.path).fsPath
      const semantics = details?.semantics.get(node.path)

      const children = node.children
        ? resolve(node.children)
        : undefined

      const counts: WorkspaceTreeNode['counts'] = {
        include: { files: 0, folders: 0 },
        exclude: { files: 0, folders: 0 },
      }

      const safe = children ?? []

      for (const child of safe) {
        // Add the counts of the child's descendants.
        counts.include.files += child.counts.include.files
        counts.include.folders += child.counts.include.folders
        counts.exclude.files += child.counts.exclude.files
        counts.exclude.folders += child.counts.exclude.folders

        // Count the child itself.
        const outcome = details?.completeExclude.get(child.path)
        if (!outcome) continue

        const category = outcome === 'include' ? 'include' : 'exclude'
        const type = child.type === 'folders' ? 'folders' : 'files'

        counts[category][type]++
      }

      tree.push({
        ...node,
        absolutePath,
        semantics,
        children,
        counts,
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