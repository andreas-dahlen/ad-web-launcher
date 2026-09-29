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

  async function patch(
    id: UUID,
    patch: Partial<SliceMap>
  ): Promise<void> {
    const index = sliceMaps.findIndex(item => item.id === id)

    if (index === -1) return

    // Object.assign(map, patch)
    // await persist()


    sliceMaps[index] = { ...sliceMaps[index], ...patch }
    await persist()
  }

  return {
    get,
    getById,
    add,
    remove,
    replace,
    patch
  }
}