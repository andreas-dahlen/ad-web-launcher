import * as vscode from 'vscode'
import type { SliceFilter, SliceMap } from '../types/core.types.ts'
// import { loadRootEntries } from '../loaders/loadRootEntries.ts'

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
    type: 'map',
    id: crypto.randomUUID(),
    name: name.trim(),
    includeFiles: [],
    includeFolders: [],
    excludeFiles: [],
    excludeFolders: []
  }
}

export async function createFilter(
): Promise<SliceFilter | null> {

  const name = await vscode.window.showInputBox({
    prompt: 'Slice Filter name',
    placeHolder: 'Pizza Filter'
  })
  if (name === undefined || name.trim().length === 0) {
    return null
  }

  return {
    type: 'filter',
    id: crypto.randomUUID(),
    name: name.trim(),
    excludeFiles: [],
    excludeFolders: []
  }
}