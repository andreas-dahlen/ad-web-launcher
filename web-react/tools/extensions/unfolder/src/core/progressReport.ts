import type { Progress } from '../types/core.types.ts'
import * as vscode from 'vscode'
export function handleProgressReport(
  folder: vscode.Uri,
  index: number,
  total: number,
  progress: Progress
) {
  const name = folder.path.split('/').at(-1) ?? ''

  progress.report({
    message: `${name} (${index + 1}/${total})`,
    increment: total > 0 ? 100 / total : 0
  })
}