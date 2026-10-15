import type { WorkspaceTreeNode } from '../types/core.types.ts'
import * as vscode from 'vscode'

export function normalizePaths(
  unsolvedObject: WorkspaceTreeNode | vscode.Uri,
  unsolvedArray: WorkspaceTreeNode[] | vscode.Uri[] | undefined
): string[] {
  const entries = unsolvedArray ?? (unsolvedObject ? [unsolvedObject] : [])
  const paths = new Set<string>()

  for (const entry of entries) {
    const absolutePath = entry instanceof vscode.Uri
      ? entry.fsPath
      : entry.absolutePath

    paths.add(absolutePath)
  }

  return [...paths]
}