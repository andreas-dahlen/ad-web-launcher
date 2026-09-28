import * as vscode from 'vscode'
import { treeItem } from '../vscode/treeItem.ts'
import type { SliceMap } from '../types/dataStructure.types.ts'
import { createMap } from '../processing/createMap.ts'
import { renameMap } from '../processing/renameMap.ts'
import type { UUID } from 'node:crypto'
import type { SliceCache } from '../processing/sliceMapCache.ts'

export type SliceProvider = NonNullable<ReturnType<typeof createSliceProvider>>
export function createSliceProvider(
  cache: SliceCache,
  output: vscode.OutputChannel
) {

  const treeChanged = new vscode.EventEmitter<void>()
  let activeMapId: string | undefined

  async function createSliceMap(): Promise<void> {
    const map = await createMap()

    if (!map) return
    await cache.add(map)

    treeChanged.fire()

    output.appendLine(`[slice maps] created: ${map.id}`)
  }

  function toggleSliceMap(id: UUID): void { //no idea if it needs async yet
    if (activeMapId === id) {
      activeMapId = undefined
      output.appendLine('[slice maps] deactivated')


      //function to handle deactivation...
    } else {
      const map = cache.getById(id)

      if (!map) return

      activeMapId = id
      output.appendLine(`[slice maps] activated: ${id}`)


      //function to start sorting... 
    }

    treeChanged.fire()
  }

  async function removeSliceMap(id: UUID): Promise<void> {
    output.appendLine(`[slice maps] remove: ${id}`)

    await cache.remove(id)

    treeChanged.fire()
  }
  async function renameSliceMap(id: UUID): Promise<void> {
    output.appendLine(`[slice maps] rename: ${id}`)
    const name = await renameMap()

    if (!name) return

    await cache.rename(id, name)

    treeChanged.fire()
  }

  function reload(): void {
    output.appendLine('[slice maps] reload')
  }
  const treeProvider: vscode.TreeDataProvider<SliceMap> = {
    onDidChangeTreeData: treeChanged.event,

    getChildren(): SliceMap[] {
      return cache.get()
    },
    getTreeItem(map: SliceMap): vscode.TreeItem {
      return treeItem(
        map,
        map.id === activeMapId
      )
    }
  }
  return {
    createSliceMap,
    toggleSliceMap,
    removeSliceMap,
    renameSliceMap,
    reload,
    treeProvider
  }
}