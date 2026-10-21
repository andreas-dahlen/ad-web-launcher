import * as vscode from 'vscode'
import { buildFileTree } from './buildFileTree.ts'
import type { TreeNode } from '../types/core.types.ts'
import type { ExclusionFileData } from '../types/vscode.types.ts'
// import picomatch from 'picomatch'

export type LoadTree = ReturnType<typeof createLoadTree>

export const createLoadTree =
  (root: vscode.WorkspaceFolder) => ({
    build(totalExclude: ExclusionFileData['total']): TreeNode[] {
      const traversalStops = vscode.workspace
        .getConfiguration('sliceMaps')
        .get<string[]>('traversalStoppers', [])

      return buildFileTree(root.uri.fsPath, totalExclude, traversalStops)
    }
  })