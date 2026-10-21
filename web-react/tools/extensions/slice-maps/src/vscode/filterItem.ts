import * as vscode from 'vscode'
import type { SliceFilter } from '../types/core.types.ts'

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

  const rawExcCalc = filter.excludeFiles.length + filter.excludeFolders.length
  const exclude = rawExcCalc === 0 ? '0' : `-${rawExcCalc}`

  const config = isConfiguring ? ' · ⚙ CONFIG' : ''

  item.description = `${exclude}${config}`

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