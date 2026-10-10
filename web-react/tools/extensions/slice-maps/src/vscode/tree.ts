import * as vscode from 'vscode'
import type { TreeProviderNode } from '../types/dataStructure.types.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'
import { mapItem } from './sliceItem.ts'
import type { AppStateCache } from '../cache/appStateCache.ts'
import { filterItem } from './filterItem.ts'
import type { VisualCache } from '../cache/visualCache.ts'
import { fileTreeItem } from './fileTreeItem.ts'

export function createTreeProvider(
  cache: SliceCache,
  state: AppStateCache,
  visualCache: VisualCache,
): {
  treeProvider: vscode.TreeDataProvider<TreeProviderNode>
  updateTree: () => void
  treeDisposable: vscode.Disposable
} {

  const treeChanged = new vscode.EventEmitter<void>()
  const treeProvider: vscode.TreeDataProvider<TreeProviderNode> = {
    onDidChangeTreeData: treeChanged.event,

    getChildren(node?: TreeProviderNode): TreeProviderNode[] {
      if (!node) {
        return [
          { type: 'mapGroup' },
          { type: 'filterGroup' },
          { type: 'workspaceGroup' }
        ]
      }

      if (node.type === 'mapGroup') {
        return cache.getMaps()
      }

      if (node.type === 'filterGroup') {
        return cache.getFilters()
      }

      if (node.type === 'workspaceGroup') {
        return visualCache.getData()?.data ?? []
      }

      if (node.type === 'folders') {
        return node.children ?? []
      }

      return []
    },
    getTreeItem(node: TreeProviderNode): vscode.TreeItem {
      if (node.type === 'mapGroup') {
        return sectionItem('Maps')
      }

      if (node.type === 'filterGroup') {
        return sectionItem('Filters')
      }

      if (node.type === 'workspaceGroup') {
        return sectionItem('Workspace')
      }

      if (node.type === 'map') {
        return mapItem(
          node,
          node.id === state.getActiveMap()?.id,
          node.id === state.getActiveConfig()?.id
        )
      }
      if (node.type === 'filter') {
        return filterItem(
          node,
          state.getActiveFilters().some(filter => filter.id === node.id),
          node.id === state.getActiveConfig()?.id
        )
      }

      const root = visualCache.getRoot()
      if (!root) {
        return new vscode.TreeItem(node.path)
      }
      return fileTreeItem(node, vscode.Uri.joinPath(root.uri, node.path))
    }
  }
  return {
    treeProvider,
    updateTree: () => treeChanged.fire(),
    treeDisposable: treeChanged,
  }
}


function sectionItem(
  label: string
): vscode.TreeItem {
  return new vscode.TreeItem(
    label,
    vscode.TreeItemCollapsibleState.Expanded
  )
}