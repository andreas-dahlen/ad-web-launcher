import * as vscode from 'vscode'
import { treeItem } from '../vscode/treeItem.ts'
import type { FormatPathResult, SliceMap } from '../types/dataStructure.types.ts'
import { createMap } from '../processing/createMap.ts'
import { renameMap } from '../processing/renameMap.ts'
import type { UUID } from 'node:crypto'
import { createSliceMapCache } from '../processing/sliceMapCache.ts'
import { deactivateMap } from '../processing/deactivateMap.ts'
import { loadHandler } from '../loaders/loadHandler.ts'
import { requestSliceMap } from '../processing/requestSliceMap.ts'
import { showMsg } from '../utils/showMsg.ts'
import { formatPath } from '../utils/formatPath.ts'
import { exclusionHandler } from '../exclude/exclusionHandler.ts'
import { activateMap } from '../processing/activateMap.ts'

export type SliceProvider = NonNullable<ReturnType<typeof createSliceProvider>>
export function createSliceProvider(
  context: vscode.ExtensionContext,
  root: vscode.WorkspaceFolder,
  output: vscode.OutputChannel
) {
  const loader = loadHandler(context, root)
  const cache = createSliceMapCache(context, loader.sliceMaps())
  const excluder = exclusionHandler(loader)
  const target = loader.getExcludeConfigTarget()

  const treeChanged = new vscode.EventEmitter<void>()
  let activeMapId: UUID | undefined
  let activeConfigId: UUID | undefined
  let localExclude: Record<string, boolean> | undefined

  async function startup(): Promise<void> {
    const cachedLocalExclude = cache.getLocalExclude()
    if (!cachedLocalExclude) return

    await deactivateMap(cachedLocalExclude, target)
    await cache.removeLocalExclude()
  }

  async function toggleSliceMap(id: UUID): Promise<void> {
    const map = cache.getById(id)
    if (!map) return

    if (activeMapId === id) {
      await deactivateSliceMap()
    } else {
      await activateSliceMap(map)
    }
  }

  async function toggleConfig(id: UUID): Promise<void> {
    if (activeConfigId === id) {
      activeConfigId = undefined
    } else {
      activeConfigId = id
    }

    treeChanged.fire()
  }

  async function createSliceMap(): Promise<void> {
    const map = await createMap()
    if (!map) return

    await cache.add(map)

    treeChanged.fire()
    output.appendLine(`[slice maps] created: ${map.id}`)
  }

  async function removeSliceMap(id: UUID): Promise<void> {

    //need to deactivate if the id is active...

    await cache.remove(id)

    treeChanged.fire()
    output.appendLine(`[slice maps] remove: ${id}`)
  }
  async function renameSliceMap(id: UUID): Promise<void> {
    const name = await renameMap()
    if (!name) return

    await cache.addContent(id, name, "name")

    treeChanged.fire()
    output.appendLine(`[slice maps] rename: ${id}`)
  }

  async function addPathToSliceMap(uri: vscode.Uri): Promise<void> {
    const target = await resolveTargetMap(uri)
    if (!target) return
    const { map, resolvedPath } = target

    await cache.addContent(map.id, resolvedPath.value, resolvedPath.type)

    treeChanged.fire()
    showMsg(`[slice maps] added ${resolvedPath.type} to ${map.name}`)
    if (activeMapId) {
      //need to update activeMap if there is one active.
    }
  }

  async function removePathFromSliceMap(uri: vscode.Uri): Promise<void> {
    const target = await resolveTargetMap(uri)
    if (!target) return
    const { map, resolvedPath } = target

    await cache.removeContent(map.id, resolvedPath.value, resolvedPath.type)

    treeChanged.fire()
    showMsg(`[slice maps] removed ${resolvedPath.type} to ${map.name}`)
    if (activeMapId) {
      //need to update activeMap if there is one active.
    }
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
    addPathToSliceMap,
    removePathFromSliceMap,
    treeProvider,
    startup
  }

  async function deactivateSliceMap() {
    if (!localExclude) throw new Error("lol")
    await deactivateMap(localExclude, target)
    await cache.removeLocalExclude()

    activeMapId = undefined
    treeChanged.fire()
    output.appendLine('[slice maps] deactivated')
  }

  async function activateSliceMap(map: SliceMap) {
    if (activeMapId !== undefined) {
      if (!localExclude) throw new Error("lol")
      await deactivateMap(localExclude, target)
    }
    localExclude = loader.getLocalExclude()
    await cache.setLocalExclude(localExclude)
    const exclude = excluder.resolve(map)
    await activateMap(localExclude, exclude, target)

    activeMapId = map.id
    treeChanged.fire()
    output.appendLine(`[slice maps] activated: ${map.id}`)
  }


  async function resolveTargetMap(uri: vscode.Uri): Promise<{
    map: SliceMap
    resolvedPath: FormatPathResult
  } | undefined> {
    //NOTE formatPath uses statSync which could throw
    const resolvedPath = formatPath(uri, root)

    let id = activeConfigId ?? activeMapId

    if (!id) {
      const checkId = await requestSliceMap(cache.get())
      if (!checkId) return

      id = checkId
      activeConfigId = checkId
      treeChanged.fire()
    }

    const map = cache.getById(id)
    if (!map) return

    return { map, resolvedPath }
  }
}