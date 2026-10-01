import * as vscode from 'vscode'
import type { UUID } from 'node:crypto'
import type { AddContent, RemoveContent, SliceMap } from '../types/dataStructure.types.ts'

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

  async function addContent(
    id: UUID,
    value: string,
    type: AddContent
  ): Promise<void> {
    const map = sliceMaps.find(item => item.id === id)
    if (!map) return

    if (type === "name") {
      map[type] = value
      await persist()
      return
    }

    if (map[type].includes(value)) return

    map[type].push(value)

    await persist()
  }

  async function removeContent(
    id: UUID,
    value: string,
    type: RemoveContent
  ): Promise<void> {
    const map = sliceMaps.find(item => item.id === id)
    if (!map) return

    map[type] = map[type].filter(item => item !== value)
    await persist()
  }

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
    addContent,
    removeContent,
    getLocalExclude,
    setLocalExclude,
    removeLocalExclude
  }
}