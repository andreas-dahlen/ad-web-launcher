import * as vscode from 'vscode'
import { treeItem } from '../vscode/treeItem.ts'
import type { FormatPathResult, SliceMap, UserChoice } from '../types/dataStructure.types.ts'
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
    if (activeMapId === id) {
      await deactivateSliceMap()
    }

    await cache.remove(id)

    treeChanged.fire()
    output.appendLine(`[slice maps] remove: ${id}`)
  }
  async function renameSliceMap(id: UUID): Promise<void> {
    const name = await renameMap()
    if (!name) return

    await cache.rename(id, name)

    treeChanged.fire()
    output.appendLine(`[slice maps] rename: ${name}`)
  }

  async function addPathToSliceMap(uri: vscode.Uri): Promise<void> {
    const target = await resolveTargetMap(uri, "include")
    if (!target) return
    const nextMap = resolveSliceMap(target)
    // await cache.addContent(map.id, resolvedPath.value, resolvedPath.type)
    await cache.replace(nextMap)

    treeChanged.fire()
    showMsg(`[slice maps] added ${target.resolvedPath.value} to ${nextMap.name}`)
    if (activeMapId === nextMap.id) {
      await updateSliceMap(nextMap)
    }
  }

  async function removePathFromSliceMap(uri: vscode.Uri): Promise<void> {
    const target = await resolveTargetMap(uri, "exclude")
    if (!target) return
    const nextMap = resolveSliceMap(target)

    // await cache.removeContent(map.id, resolvedPath.value, resolvedPath.type)
    await cache.replace(nextMap)

    treeChanged.fire()
    showMsg(`[slice maps] removed ${target.resolvedPath.value} to ${nextMap.name}`)
    if (activeMapId === nextMap.id) {
      await updateSliceMap(nextMap)
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
    if (!localExclude) {
      output.appendLine('[slice maps] error: localExclude is undefined')
      return
    }
    await deactivateMap(localExclude, target)
    await cache.removeLocalExclude()

    activeMapId = undefined
    treeChanged.fire()
    output.appendLine('[slice maps] deactivated')
  }

  async function activateSliceMap(map: SliceMap) {
    if (activeMapId !== undefined) {
      if (!localExclude) {
        output.appendLine('[slice maps] error: localExclude is undefined')
        return
      }
      await deactivateMap(localExclude, target)
    }
    localExclude = loader.getLocalExclude()
    await cache.setLocalExclude(localExclude)
    const exclude = excluder.resolve(map) ?? excluder.getResolution(map)
    if (!exclude) {
      output.appendLine(`[ERROR] exclusion unresolved`)
      return
    }
    await activateMap(localExclude, exclude, target)

    activeMapId = map.id
    activeConfigId = map.id
    treeChanged.fire()
    output.appendLine(`[slice maps] activated: ${map.name}`)
  }

  async function updateSliceMap(map: SliceMap) {
    if (!localExclude) {
      output.appendLine('[slice maps] error: localExclude is undefined')
      return
    }
    const exclude = excluder.resolve(map)
    if (!exclude) {
      output.appendLine(`[DEBUG] found no difference in exclude resolution`)
      return
    }

    await activateMap(localExclude, exclude, target)

    treeChanged.fire()
    output.appendLine(`[slice maps] updated: ${map.name}`)
  }

  async function resolveTargetMap(uri: vscode.Uri, choice: UserChoice): Promise<{
    map: SliceMap
    resolvedPath: FormatPathResult
  } | undefined> {
    //NOTE formatPath uses statSync which could throw
    const resolvedPath = formatPath(uri, root, choice)

    let id = activeConfigId ?? activeMapId

    if (!id) {
      const maps = cache.get()
      if (maps.length === 1) {
        activeConfigId = maps[0].id
        treeChanged.fire()
        return { map: maps[0], resolvedPath }
      }
      const newId = await requestSliceMap(maps)
      if (!newId) return
      id = newId
      activeConfigId = newId
      treeChanged.fire()
    }

    const map = cache.getById(id)
    if (!map) return

    return { map, resolvedPath }
  }
}