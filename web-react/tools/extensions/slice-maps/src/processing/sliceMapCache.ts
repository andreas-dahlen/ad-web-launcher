import * as vscode from 'vscode'
import type { UUID } from 'node:crypto'
import type { SliceMap } from '../types/dataStructure.types.ts'

export type SliceCache = NonNullable<ReturnType<typeof createSliceMapCache>>

export function createSliceMapCache(
  context: vscode.ExtensionContext,
  sliceMaps: SliceMap[]
) {

  async function persist(): Promise<void> {
    await context.workspaceState.update(
      'sliceMaps',
      sliceMaps
    )
  }

  function get(): SliceMap[] {
    return sliceMaps
  }

  function getById(id: UUID): SliceMap | null {
    return sliceMaps.find(map => map.id === id) ?? null
  }

  async function add(map: SliceMap): Promise<void> {
    sliceMaps.push(map)
    await persist()
  }

  async function remove(id: UUID): Promise<SliceMap | null> {
    const index = sliceMaps.findIndex(map => map.id === id)

    if (index === -1) return null

    const [map] = sliceMaps.splice(index, 1)

    await persist()

    return map
  }

  async function replace(map: SliceMap): Promise<void> {
    const index = sliceMaps.findIndex(item => item.id === map.id)

    if (index === -1) return

    sliceMaps[index] = map
    await persist()
  }

  async function rename(id: UUID, name: string): Promise<void> {
    const map = sliceMaps.find(item => item.id === id)
    if (!map) return

    map.name = name
    await persist()
  }

  // async function addContent(
  //   id: UUID,
  //   value: string,
  //   type: AddContent
  // ): Promise<string | void> {
  //   const map = sliceMaps.find(item => item.id === id)
  //   if (!map) return

  //   if (type === "name") {
  //     map[type] = value
  //     await persist()
  //     return value
  //   }

  //   if (map[type].includes(value)) return

  //   map[type].push(value)

  //   await persist()
  // }

  // async function removeContent(
  //   id: UUID,
  //   value: string,
  //   type: RemoveContent
  // ): Promise<void> {
  //   const map = sliceMaps.find(item => item.id === id)
  //   if (!map) return

  //   map[type] = map[type].filter(item => item !== value)

  //   if (type === "folders") {
  //     map.folders = map.folders.filter(path => !path.startsWith(`${value}/`))
  //     map.files = map.files.filter(path => !path.startsWith(`${value}/`))
  //   } else if (type === "excludeFolders") {
  //     map.excludeFolders = map.excludeFolders.filter(path => !path.startsWith(`${value}/`))
  //     map.excludeFiles = map.excludeFiles.filter(path => !path.startsWith(`${value}/`))
  //   }

  //   await persist()
  // }

  function getLocalExclude(): Record<string, boolean> | undefined {
    return context.workspaceState.get<Record<string, boolean>>('localExclude')
  }
  async function setLocalExclude(localExclude: Record<string, boolean>): Promise<void> {
    await context.workspaceState.update(
      'localExclude',
      localExclude
    )
  }
  async function removeLocalExclude(): Promise<void> {
    await context.workspaceState.update(
      'localExclude',
      undefined
    )
  }

  return {
    get,
    getById,
    add,
    remove,
    replace,
    rename,
    // addContent,
    // removeContent,
    getLocalExclude,
    setLocalExclude,
    removeLocalExclude
  }
}