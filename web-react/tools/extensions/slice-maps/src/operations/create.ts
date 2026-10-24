import * as vscode from 'vscode'

import type { SliceFilter, SliceMap } from '../types/core.types.ts'

const MAX_NAME_LENGTH = 20

export async function createMap(): Promise<SliceMap | null> {
  const name = await vscode.window.showInputBox({
    prompt: 'Slice map name',
    placeHolder: 'Pizza Slice',
    validateInput: value => {
      const trimmed = value.trim()

      if (!trimmed) return 'Name cannot be empty'
      if (trimmed.length > MAX_NAME_LENGTH) {
        return `Name cannot exceed ${MAX_NAME_LENGTH} characters`
      }

      return null
    }
  })

  const trimmed = name?.trim()
  if (!trimmed) return null

  return {
    type: 'map',
    id: crypto.randomUUID(),
    name: trimmed,
    includeFiles: [],
    includeFolders: [],
    excludeFiles: [],
    excludeFolders: []
  }
}

export async function createFilter(): Promise<SliceFilter | null> {
  const name = await vscode.window.showInputBox({
    prompt: 'Slice Filter name',
    placeHolder: 'Tortilla Filter',
    validateInput: value => {
      const trimmed = value.trim()

      if (!trimmed) return 'Name cannot be empty'
      if (trimmed.length > MAX_NAME_LENGTH) {
        return `Name cannot exceed ${MAX_NAME_LENGTH} characters`
      }

      return null
    }
  })

  const trimmed = name?.trim()
  if (!trimmed) return null

  return {
    type: 'filter',
    id: crypto.randomUUID(),
    name: trimmed,
    excludeFiles: [],
    excludeFolders: []
  }
}