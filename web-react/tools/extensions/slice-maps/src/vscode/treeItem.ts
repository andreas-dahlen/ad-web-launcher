import * as vscode from 'vscode'
import type { SliceMap } from '../types/dataStructure.types.ts'

export function treeItem(
  map: SliceMap,
  isActive: boolean
): vscode.TreeItem {
  const item = new vscode.TreeItem(
    map.name,
    vscode.TreeItemCollapsibleState.None
  )

  item.id = `${map.id}-${isActive}`

  item.contextValue = 'sliceMap'

  item.iconPath = new vscode.ThemeIcon(
    isActive ? 'circle-filled' : 'circle-outline',
    isActive
      ? new vscode.ThemeColor('charts.red')
      : undefined
  )

  item.command = {
    command: 'sliceMaps.activate',
    title: 'Activate Slice Map',
    arguments: [map.id]
  }

  return item
}