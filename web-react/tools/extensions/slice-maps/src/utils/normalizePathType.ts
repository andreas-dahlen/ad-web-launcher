import path from 'node:path'
import type { VisualTreeNode } from '../types/dataStructure.types.ts'
import * as vscode from 'vscode'

export function normalizePaths(
  unsolvedObject: VisualTreeNode | vscode.Uri,
  unsolvedArray: VisualTreeNode[] | vscode.Uri[] | undefined,
  root: vscode.WorkspaceFolder
): string[] {
  const entries = unsolvedArray ?? (unsolvedObject ? [unsolvedObject] : [])
  const paths = new Set<string>()

  for (const entry of entries) {
    const absolutePath = entry instanceof vscode.Uri
      ? entry.fsPath
      : path.resolve(root.uri.fsPath, entry.path)

    paths.add(absolutePath)
  }

  return [...paths]
}