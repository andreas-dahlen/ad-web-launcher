import * as vscode from 'vscode'
import { loadHandler } from '../processing/loadHandler.ts'
type SliceMap = {
  id: string
  name: string
}

export function createSliceProvider(
  context: vscode.ExtensionContext,
  output: vscode.OutputChannel
) {

  const loaded = loadHandler(context)

  if (!loaded) return

  const maps = loaded.sliceMaps
  // ]
  const treeChanged = new vscode.EventEmitter<void>()
  let activeMapId: string | undefined

  function createSliceMap(): void {
    output.appendLine('[slice maps] create')
  }

  function toggleSliceMap(id: string): void {
    if (activeMapId === id) {
      activeMapId = undefined
      output.appendLine('[slice maps] deactivated')
    } else {
      activeMapId = id
      output.appendLine(`[slice maps] activated: ${id}`)
    }

    treeChanged.fire()
  }

  function removeSliceMap(id: string): void {
    output.appendLine(`[slice maps] remove: ${id}`)
  }

  function reload(): void {
    output.appendLine('[slice maps] reload')
  }
  const treeProvider: vscode.TreeDataProvider<SliceMap> = {
    onDidChangeTreeData: treeChanged.event,

    getChildren(): SliceMap[] {
      return maps
    },

    getTreeItem(map: SliceMap): vscode.TreeItem {
      const item = new vscode.TreeItem(
        map.name,
        vscode.TreeItemCollapsibleState.None,
      )

      item.id = `${map.id}-${map.id === activeMapId}`

      item.iconPath = new vscode.ThemeIcon(
        map.id === activeMapId ? 'circle-filled' : 'circle-outline',
        map.id === activeMapId
          ? new vscode.ThemeColor('charts.red')
          : undefined,
      )

      item.command = {
        command: 'sliceMaps.activate',
        title: 'Activate Slice Map',
        arguments: [map.id],
      }

      return item
    }
  }
  return {
    createSliceMap,
    toggleSliceMap,
    removeSliceMap,
    reload,
    treeProvider
  }

}