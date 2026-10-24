import * as vscode from 'vscode'
import type { ActiveSlice } from '../types/core.types.ts'

export type SliceOperation =
  | 'include'
  | 'exclude'
  | 'addExclude'
  | 'removeExclude'
  | 'excludeAll'

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
        { label: 'Exclude All', operation: 'excludeAll' },
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