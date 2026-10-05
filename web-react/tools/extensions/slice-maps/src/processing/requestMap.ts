import type { UUID } from 'node:crypto'
import * as vscode from 'vscode'
import type { SliceMap } from '../types/dataStructure.types.ts'
export async function requestMap(maps: SliceMap[]): Promise<UUID | null> {

  const selected = await vscode.window.showQuickPick(
    maps.map(map => ({
      label: map.name,
      description: map.id,
      id: map.id,
    })),
    {
      placeHolder: 'Select a Slice Map',
    }
  )

  if (!selected) return null

  return selected.id
}
