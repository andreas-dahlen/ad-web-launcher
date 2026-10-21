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

  const config = isConfiguring ? ' · ⚙ CONFIG' : ''

  item.description = `${include} / ${exclude}${config}`

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