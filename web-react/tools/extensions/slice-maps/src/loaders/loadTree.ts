import * as vscode from 'vscode'
import { buildFileTree } from './buildFileTree.ts'
import type { TreeNode } from '../types/core.types.ts'
import type { NativeBackupHandler } from '../core/nativeBackupHandler.ts'
// import picomatch from 'picomatch'

export type LoadTree = ReturnType<typeof createLoadTree>

export const createLoadTree =
  (
    root: vscode.WorkspaceFolder,
    native: NativeBackupHandler
  ) => ({
    build(): TreeNode[] {

      const totalExclude = native.getTotalExclude()
      if (!totalExclude) return []


      const traversalStops = vscode.workspace
        .getConfiguration('sliceMaps')
        .get<string[]>('traversalStoppers', [])

      return buildFileTree(
        root.uri.fsPath,
        totalExclude,
        traversalStops
      )
    }
  })