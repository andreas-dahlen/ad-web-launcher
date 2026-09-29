import fs from 'node:fs'
import path from 'node:path'
import type * as vscode from 'vscode'

export function formatPath(
  uri: vscode.Uri,
  root: vscode.WorkspaceFolder
) {
  const absolutePath = uri.fsPath

  const solvedPath = path.relative(
    root.uri.fsPath,
    absolutePath
  )

  return {
    path: solvedPath,
    type: fs.statSync(absolutePath).isDirectory()
      ? 'folder'
      : 'file',
  }
}