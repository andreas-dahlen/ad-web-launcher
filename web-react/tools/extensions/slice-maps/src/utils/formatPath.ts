import fs from 'node:fs'
import path from 'node:path'
import type * as vscode from 'vscode'
import type { NormalizedPaths, UserChoice } from '../types/dataStructure.types.ts'

export function resolvePaths(
  uris: vscode.Uri[],
  root: vscode.WorkspaceFolder,
  choice: UserChoice
): NormalizedPaths {

  const resolvedPaths: NormalizedPaths = {
    includeFiles: [],
    includeFolders: [],
    excludeFiles: [],
    excludeFolders: []
  }
  for (const uri of uris) {
    //NOTE formatPath uses statSync which could throw
    const absolutePath = uri.fsPath
    const solvedPath = path.relative(
      root.uri.fsPath,
      absolutePath
    )
    const isDirectory = fs.statSync(absolutePath).isDirectory()

    let paths: string[]

    if (isDirectory) {
      paths = choice === 'exclude'
        ? resolvedPaths.excludeFolders
        : resolvedPaths.includeFolders
    } else {
      paths = choice === 'exclude'
        ? resolvedPaths.excludeFiles
        : resolvedPaths.includeFiles
    }
    paths.push(solvedPath)
  }
  return resolvedPaths
}