import * as vscode from 'vscode'
import { treeItem } from '../vscode/treeItem.ts'
import type { SliceMap } from '../types/dataStructure.types.ts'
import { createMap } from '../processing/createMap.ts'
import { renameMap } from '../processing/renameMap.ts'
import type { UUID } from 'node:crypto'
import { createSliceMapCache } from '../processing/sliceMapCache.ts'
import { deactivateMap } from '../processing/deactivateMap.ts'
import { loadHandler } from '../loaders/loadHandler.ts'
import { addPathToMap } from '../processing/addPathToMap.ts'
import { showMsg } from '../utils/showMsg.ts'
import { formatPath } from '../utils/formatPath.ts'

export type SliceProvider = NonNullable<ReturnType<typeof createSliceProvider>>
export function createSliceProvider(
  context: vscode.ExtensionContext,
  root: vscode.WorkspaceFolder,
  output: vscode.OutputChannel
) {

  const loader = loadHandler(context, root)
  const cache = createSliceMapCache(context, loader.sliceMaps())

  const treeChanged = new vscode.EventEmitter<void>()
  let activeMapId: UUID | undefined
  let activeConfigId: UUID | undefined


  async function createSliceMap(): Promise<void> {
    const map = await createMap()

    if (!map) return
    await cache.add(map)

    treeChanged.fire()

    output.appendLine(`[slice maps] created: ${map.id}`)
  }

  async function toggleSliceMap(id: UUID): Promise<void> {
    const map = cache.getById(id)
    if (!map) return
    const exclude = loader.exclude()
    const config = loader.getExcludeConfig()
    if (activeMapId === id) {
      activeMapId = undefined
      treeChanged.fire()
      await deactivateMap(map, exclude, config)

      output.appendLine('[slice maps] deactivated')
    } else {
      // const tree = loader.fileTree()
      // const newMap: SliceMap | null = resolveExclusions(map, tree)
      // 
      // const activationMap = newMap ?? map
      // await activateMap(activationMap, exclude, config)
      // if (newMap) await cache.update(newMap)

      activeMapId = id
      output.appendLine(`[slice maps] activated: ${id}`)
      treeChanged.fire()
    }
  }

  function toggleConfig(id: UUID): void {
    if (activeConfigId === id) {
      activeConfigId = undefined
    } else {
      activeConfigId = id
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

    await cache.patch(id, { name })

    treeChanged.fire()
  }

  async function addPathToSliceMap(uri: vscode.Uri): Promise<void> {

    //NOTE formatPath uses statSync which could throw
    const resolvedPath = formatPath(uri, root)

    let id = activeConfigId ?? activeMapId

    if (!id) {
      const checkId = await addPathToMap(cache.get())
      if (!checkId) return
      id = checkId
      activeConfigId = checkId
      treeChanged.fire()
    }

    const map = cache.getById(id)
    if (!map) return

    if (resolvedPath.type === "file") {
      await cache.patch(id, { files: [...map.files, resolvedPath.path] })
    } else {
      await cache.patch(id, { folders: [...map.folders, resolvedPath.path] })
    }

    showMsg(`[slice maps] added ${resolvedPath.type} to ${map.name}`)

    if (activeMapId) {
      //need to update activeMap if there is one active.
    }
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
        map.id === activeMapId,
        map.id === activeConfigId
      )
    }
  }
  return {
    toggleSliceMap,
    toggleConfig,
    createSliceMap,
    removeSliceMap,
    renameSliceMap,
    reload,
    addPathToSliceMap,
    treeProvider
  }
}