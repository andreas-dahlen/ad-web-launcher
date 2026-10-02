import * as vscode from 'vscode'
import type { SliceMap } from '../types/dataStructure.types.ts'

export async function createMap(
): Promise<SliceMap | null> {

  const name = await vscode.window.showInputBox({
    prompt: 'Slice map name',
    placeHolder: 'Pizza Slice'
  })


  if (name === undefined || name.trim().length === 0) {
    return null
  }


  return {
    id: crypto.randomUUID(),
    name: name.trim(),
    includeFiles: [],
    includeFolders: [],
    excludeFiles: [],
    excludeFolders: []
  }
}