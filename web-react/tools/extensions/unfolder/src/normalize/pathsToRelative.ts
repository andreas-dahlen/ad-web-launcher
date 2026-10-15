import fs from 'node:fs'
import path from 'node:path'
import type * as vscode from 'vscode'
import type { NormalizedPaths, ExcludeOrInclude } from '../types/core.types.ts'

export function pathsToRelative(
  absolutePaths: string[],
  root: vscode.WorkspaceFolder,
  choice: ExcludeOrInclude
): NormalizedPaths {

  for (const absolutePath of absolutePaths) {
    //NOTE formatPath uses statSync which could throw
    const solvedPath = path.relative(
      root.uri.fsPath,
      absolutePath
    )
    const isDirectory = fs.statSync(absolutePath).isDirectory()

    let paths: string[]
  }
}
return resolvedPaths
}