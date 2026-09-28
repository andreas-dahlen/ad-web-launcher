import type { UUID } from 'node:crypto'
import type { LoadedConfig, SliceMap } from '../types/dataStructure.types.ts'
import * as vscode from 'vscode'

export type SliceCache = NonNullable<ReturnType<typeof createSliceMapCache>>

export function createSliceMapCache(
  context: vscode.ExtensionContext,
  data: LoadedConfig
) {

  async function persist(): Promise<void> {
    await context.workspaceState.update(
      'sliceMaps',
      data.sliceMaps
    )
  }

  function get(): SliceMap[] {
    return data.sliceMaps
  }

  function getById(id: UUID): SliceMap | null {
    return data.sliceMaps.find(map => map.id === id) ?? null
  }

  async function add(map: SliceMap): Promise<void> {
    data.sliceMaps.push(map)
    await persist()
  }

  async function remove(id: UUID): Promise<SliceMap | null> {
    const index = data.sliceMaps.findIndex(map => map.id === id)

    if (index === -1) return null

    const [map] = data.sliceMaps.splice(index, 1)

    await persist()

    return map
  }

  async function update(map: SliceMap): Promise<void> {
    const index = data.sliceMaps.findIndex(item => item.id === map.id)

    if (index === -1) return

    data.sliceMaps[index] = map
    await persist()
  }

  async function rename(id: UUID, name: string): Promise<void> {
    const index = data.sliceMaps.findIndex(item => item.id === id)

    if (index === -1) return

    data.sliceMaps[index].name = name
    await persist()
  }

  return {
    get,
    getById,
    add,
    remove,
    update,
    rename
  }
}