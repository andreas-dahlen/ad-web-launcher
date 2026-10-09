import * as vscode from 'vscode'
import type { SliceTreeNode } from '../types/dataStructure.types.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'
import { mapItem } from './sliceItem.ts'
import type { AppStateCache } from '../cache/appStateCache.ts'
import { filterItem } from './filterItem.ts'

export function createTreeProvider(
  cache: SliceCache,
  state: AppStateCache
): {
  treeProvider: vscode.TreeDataProvider<SliceTreeNode>
  treeChanged: vscode.EventEmitter<void>
} {
  const treeChanged = new vscode.EventEmitter<void>()
  const treeProvider: vscode.TreeDataProvider<SliceTreeNode> = {
    onDidChangeTreeData: treeChanged.event,

    getChildren(node?: SliceTreeNode): SliceTreeNode[] {
      if (!node) {
        return [
          { type: 'mapGroup' },
          { type: 'filterGroup' }
        ]
      }

      if (node.type === 'mapGroup') {
        return cache.getMaps()
      }

      if (node.type === 'filterGroup') {
        return cache.getFilters()
      }

      return []
    },
    getTreeItem(node: SliceTreeNode): vscode.TreeItem {
      if (node.type === 'mapGroup') {
        return sectionItem('Maps')
      }

      if (node.type === 'filterGroup') {
        return sectionItem('Filters')
      }

      if (node.type === 'map') {
        return mapItem(
          node,
          node.id === state.getActiveMap()?.id,
          node.id === state.getActiveConfig()?.id
        )
      }

      return filterItem(
        node,
        state.getActiveFilters().some(filter => filter.id === node.id),
        node.id === state.getActiveConfig()?.id
      )
    }
  }
  return {
    treeProvider,
    treeChanged
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