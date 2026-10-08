import * as vscode from 'vscode'
import type { SliceMap } from '../types/dataStructure.types.ts'

export function mapItem(
  map: SliceMap,
  isActive: boolean,
  isConfiguring: boolean
): vscode.TreeItem {
  const item = new vscode.TreeItem(
    map.name,
    vscode.TreeItemCollapsibleState.None
  )

  item.id = `${map.id}-${isActive}`

  item.contextValue = 'sliceMap'
  item.description = isConfiguring ? '⚙ CONFIG' : undefined

  item.iconPath = new vscode.ThemeIcon(
    isActive ? 'circle-filled' : 'circle-outline',
    isActive
      ? new vscode.ThemeColor('charts.red')
      : undefined
  )

  item.command = {
    command: 'sliceMaps.toggle',
    title: 'Toggle Slice',
    arguments: [map]
  }

  return item
}