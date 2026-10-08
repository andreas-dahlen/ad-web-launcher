import * as vscode from 'vscode'
import type { SliceFilter } from '../types/dataStructure.types.ts'

export function filterItem(
  filter: SliceFilter,
  isActive: boolean,
  isConfiguring: boolean
): vscode.TreeItem {
  const item = new vscode.TreeItem(
    filter.name,
    vscode.TreeItemCollapsibleState.None
  )

  item.id = `${filter.id}-${isActive}`

  item.contextValue = 'sliceFilter'
  item.description = isConfiguring ? '⚙ CONFIG' : undefined

  item.iconPath = new vscode.ThemeIcon(
    isActive ? 'circle-filled' : 'circle-outline',
    isActive
      ? new vscode.ThemeColor('charts.red')
      : undefined
  )

  item.command = {
    command: 'sliceMaps.toggleFilter',
    title: 'Toggle Filter',
    arguments: [filter]
  }

  return item
}