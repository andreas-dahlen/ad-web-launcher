import * as vscode from 'vscode'
import type { SliceTreeNode } from '../types/core.types.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'
import { mapItem } from './sliceItem.ts'
import type { AppStateCache } from '../cache/appStateCache.ts'
import { filterItem } from './filterItem.ts'

export function createSliceTreeProvider(
  sliceCache: SliceCache,
  appState: AppStateCache
): {
  sliceTreeProvider: vscode.TreeDataProvider<SliceTreeNode>
  updateSliceTree: () => void
  sliceTreeDisposable: vscode.Disposable
} {

  const sliceTreeChanged = new vscode.EventEmitter<void>()
  const sliceTreeProvider: vscode.TreeDataProvider<SliceTreeNode> = {
    onDidChangeTreeData: sliceTreeChanged.event,

    getChildren(node?: SliceTreeNode): SliceTreeNode[] {
      if (!node) {
        return [
          { type: 'mapGroup' },
          { type: 'filterGroup' }
        ]
      }

      if (node.type === 'mapGroup') {
        return sliceCache.getMaps()
      }

      if (node.type === 'filterGroup') {
        return sliceCache.getFilters()
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
          node.id === appState.getActiveMap()?.id,
          node.id === appState.getActiveConfig()?.id
        )
      }
      return filterItem(
        node,
        appState.getActiveFilters().some(filter => filter.id === node.id),
        node.id === appState.getActiveConfig()?.id
      )
    }
  }
  return {
    sliceTreeProvider,
    updateSliceTree: () => sliceTreeChanged.fire(),
    sliceTreeDisposable: sliceTreeChanged,
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