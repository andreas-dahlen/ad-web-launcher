import type { WorkspaceTreeNode } from '../types/core.types.ts'
import * as vscode from 'vscode'

// export async function normalizePaths(
//   unsolvedObject: WorkspaceTreeNode | vscode.Uri | undefined,
//   unsolvedArray: WorkspaceTreeNode[] | vscode.Uri[] | undefined
// ): Promise<string[]> {
//   const entries = unsolvedArray ?? (unsolvedObject ? [unsolvedObject] : [])
//   const paths = new Set<string>()

//   for (const entry of entries) {
//     const absolutePath = entry instanceof vscode.Uri
//       ? entry.fsPath
//       : entry.absolutePath

//     paths.add(absolutePath)
//   }

//   if (paths.size === 0) {
//     const backup = await getExplorerSelection()
//     backup.forEach(uri => paths.add(uri.fsPath));
//   }

//   return [...paths]
// }



export async function normalizeExplorerPaths(
  unsolvedArray: vscode.Uri[] | undefined
): Promise<string[]> {
  const entries = unsolvedArray ?? []
  const paths = new Set<string>()

  for (const uri of entries) {
    paths.add(uri.fsPath)
  }

  if (paths.size === 0) {
    const backup = await getExplorerSelection()
    backup.forEach(uri => paths.add(uri.fsPath))
  }

  return [...paths]
}


export function normalizeTreePaths(
  target: WorkspaceTreeNode | undefined,
  selection: readonly WorkspaceTreeNode[]
): string[] {
  const paths = new Set(selection.map(node => node.absolutePath))

  if (target) {
    paths.add(target.absolutePath)
  }

  return [...paths]
}

async function getExplorerSelection(): Promise<vscode.Uri[]> {
  let previousClipboard: string | undefined

  try {
    previousClipboard = await vscode.env.clipboard.readText()

    await vscode.commands.executeCommand('copyFilePath')

    const clipboard = await vscode.env.clipboard.readText()
    if (!clipboard) return []

    const uris: vscode.Uri[] = []

    for (const filePath of clipboard.split(/\r?\n/)) {
      const value = filePath.trim()
      if (!value) continue

      try {
        const uri = vscode.Uri.file(value)
        await vscode.workspace.fs.stat(uri)
        uris.push(uri)
      } catch {
        continue
      }
    }

    return uris
  } finally {
    if (previousClipboard !== undefined) {
      try {
        await vscode.env.clipboard.writeText(previousClipboard)
      }
      catch {
        // Clipboard restoration failed. 
      }
    }
  }
}