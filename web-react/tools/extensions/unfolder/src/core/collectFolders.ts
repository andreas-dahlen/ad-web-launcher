import * as vscode from 'vscode'
import type { Match } from '../types/core.types.ts'
export async function collectFolders(
  uri: vscode.Uri,
  token: vscode.CancellationToken,
  patterns: Match[],
  fileExcludes: Match[]
): Promise<vscode.Uri[]> {

  try {
    const stat = await vscode.workspace.fs.stat(uri)
    if ((stat.type & vscode.FileType.Directory) === 0) return []
  } catch {
    return []
  }

  const folders: vscode.Uri[] = []
  const queue: vscode.Uri[] = [uri]
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri)
  let index = 0

  while (index < queue.length) {
    if (token.isCancellationRequested) break

    const current = queue[index++]
    if (!current) continue

    const name = current.path.split('/').at(-1) ?? ''
    const relativePath = workspaceFolder
      ? vscode.workspace.asRelativePath(current, false)
        .replaceAll('\\', '/')
      : name

    if (patterns.some((matches) => matches(name))
      || fileExcludes.some((matches) => matches(relativePath))) continue

    folders.push(current)

    let entries: [string, vscode.FileType][]

    try {
      entries = await vscode.workspace.fs.readDirectory(current)
    } catch {
      continue
    }

    for (const [name, type] of entries) {
      if (type !== vscode.FileType.Directory) continue
      queue.push(vscode.Uri.joinPath(current, name))
    }
  }

  return folders
}