import fs from 'node:fs'
import path from 'node:path'
import type * as vscode from 'vscode'
import type { FormatPathResult, UserChoice } from '../types/dataStructure.types.ts'

export function formatPath(
  uri: vscode.Uri,
  root: vscode.WorkspaceFolder,
  choice: UserChoice
): FormatPathResult {
  const absolutePath = uri.fsPath

  const solvedPath = path.relative(
    root.uri.fsPath,
    absolutePath
  )

  return {
    value: solvedPath,
    type: fs.statSync(absolutePath).isDirectory()
      ? `${choice}Folders`
      : `${choice}Files`
  }
}