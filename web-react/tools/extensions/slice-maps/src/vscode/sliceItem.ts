import * as vscode from 'vscode'
import type { SliceMap } from '../types/core.types.ts'

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

  const rawIncCalc = map.includeFiles.length + map.includeFolders.length
  const rawExcCalc = map.excludeFiles.length + map.excludeFolders.length

  const include = rawIncCalc === 0 ? '0' : `+${rawIncCalc}`
  const exclude = rawExcCalc === 0 ? '0' : `-${rawExcCalc}`

  item.description = `${include} / ${exclude}`

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
    command: 'sliceMaps.toggleMap',
    title: 'Toggle Slice',
    arguments: [map]
  }

  return item
}