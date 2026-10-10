import * as vscode from 'vscode'
import type { ActiveSlice } from '../types/dataStructure.types.ts'

export type SliceOperation =
  | 'include'
  | 'exclude'
  | 'addExclude'
  | 'removeExclude'

export async function requestOperation(
  identity: ActiveSlice
): Promise<SliceOperation | undefined> {
  const operations: {
    label: string
    operation: SliceOperation
  }[] = identity.type === 'map'
      ? [
        { label: 'Include', operation: 'include' },
        { label: 'Exclude', operation: 'exclude' },
      ]
      : [
        { label: 'Add Exclusion', operation: 'addExclude' },
        { label: 'Remove Exclusion', operation: 'removeExclude' },
      ]

  const selected = await vscode.window.showQuickPick(
    operations.map(({ label, operation }) => ({
      label,
      operation,
    })),
    {
      placeHolder: 'Select an Operation',
    }
  )

  return selected?.operation
}