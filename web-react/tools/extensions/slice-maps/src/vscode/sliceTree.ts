import * as vscode from 'vscode'
import type { SliceTreeNode } from '../types/core.types.ts'
import type { SliceCache } from '../cache/sliceMapCache.ts'
import { mapItem } from './sliceItem.ts'
import type { AppStateCache } from '../cache/appStateCache.ts'
import { filterItem } from './filterItem.ts'
import type { ConfigCache } from '../identity/configIdentity.ts'

export function createSliceTreeProvider(
  sliceCache: SliceCache,
  appGet: AppStateCache["appGet"],
  conf: ConfigCache
): {
  sliceMapsView: vscode.TreeView<SliceTreeNode>
  sliceMapsWorkspaceView: vscode.TreeView<SliceTreeNode>
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
        return sectionItem('Maps', 'sliceMapGroup')
      }

      if (node.type === 'filterGroup') {
        return sectionItem('Filters', 'sliceFilterGroup')
      }

      if (node.type === 'map') {
        return mapItem(
          node,
          node.id === appGet.getActiveMap()?.id,
          node.id === conf.getActiveConfig()?.id
        )
      }
      return filterItem(
        node,
        appGet.getActiveFilters().some(filter => filter.id === node.id),
        node.id === conf.getActiveConfig()?.id
      )
    }
  }

  const sliceMapsView = vscode.window.createTreeView('sliceMaps', {
    treeDataProvider: sliceTreeProvider
  })

  const sliceMapsWorkspaceView = vscode.window.createTreeView('sliceMapsWorkspace', {
    treeDataProvider: sliceTreeProvider
  })

  return {
    sliceMapsView,
    sliceMapsWorkspaceView,
    updateSliceTree: () => sliceTreeChanged.fire(),
    sliceTreeDisposable: sliceTreeChanged,
  }
}

function sectionItem(
  label: string,
  contextValue: string
): vscode.TreeItem {
  const item = new vscode.TreeItem(
    label,
    vscode.TreeItemCollapsibleState.Expanded
  )
  item.contextValue = contextValue

  return item
}