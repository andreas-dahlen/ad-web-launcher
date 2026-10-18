import fs from 'node:fs'
import path from 'node:path'
import type * as vscode from 'vscode'
import type { ExcludeOrInclude, PathChoice } from '../types/core.types.ts'

export function pathsToRelative(
  absolutePaths: string[],
  root: vscode.WorkspaceFolder,
  action: ExcludeOrInclude
): PathChoice {

  const files = new Set<string>()
  const folders = new Set<string>()

  for (const absolutePath of absolutePaths) {
    //NOTE formatPath uses statSync which could throw
    const solvedPath = path.relative(
      root.uri.fsPath,
      absolutePath
    )
    const isDirectory = fs.statSync(absolutePath).isDirectory()

    if (isDirectory) {
      folders.add(solvedPath)
    } else {
      files.add(solvedPath)
    }
  }

  return {
    action,
    files,
    folders
  }
}