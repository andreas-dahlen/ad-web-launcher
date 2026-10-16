import * as vscode from 'vscode'
import { hasBasePath } from '../utils/comparePaths.ts'
export async function filterFolders(uris: vscode.Uri[]): Promise<vscode.Uri[]> {
  const folders: vscode.Uri[] = []

  for (const uri of uris) {
    try {
      const stat = await vscode.workspace.fs.stat(uri)
      if ((stat.type & vscode.FileType.Directory) !== 0) {
        folders.push(uri)
      }
    } catch {
      continue
    }
  }

  const paths = folders
    .map((uri) => uri.fsPath)
    .toSorted((a, b) => a.length - b.length)

  const selected = new Set<string>()

  return paths
    .filter((path) => {
      if (hasBasePath(selected, path)) return false

      selected.add(path)
      return true
    })
    .map((path) => vscode.Uri.file(path))
}