import * as vscode from 'vscode'
import type { ActiveSlice, SliceFilter, SliceMap } from '../types/dataStructure.types.ts'
export async function requestSlice(
  maps: SliceMap[],
  filters: SliceFilter[]
): Promise<ActiveSlice | null> {

  const all = [...maps, ...filters]

  const selected = await vscode.window.showQuickPick(
    all.map(slice => ({
      label: slice.name,
      description: slice.id,
      identity: {
        type: slice.type,
        id: slice.id,
      },
    })),
    {
      placeHolder: 'Select a Slice',
    }
  )

  return selected?.identity ?? null
}
