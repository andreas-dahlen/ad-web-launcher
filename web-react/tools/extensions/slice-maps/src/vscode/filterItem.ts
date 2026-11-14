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

  item.description = `${exclude}`

  const icon = isConfiguring
    ? (isActive ? 'record' : 'circle-filled')
    : (isActive ? 'circle-filled' : 'circle-outline')

  const color = isConfiguring
    ? (isActive ? 'charts.purple' : 'charts.blue')
    : (isActive ? 'charts.red' : undefined)

  item.iconPath = new vscode.ThemeIcon(
    icon,
    color ? new vscode.ThemeColor(color) : undefined
  )

  item.command = {
    command: 'sliceMaps.toggleFilter',
    title: 'Toggle Filter',
    arguments: [filter]
  }

  return item
}