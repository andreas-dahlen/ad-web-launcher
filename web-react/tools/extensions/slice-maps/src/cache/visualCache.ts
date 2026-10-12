import { enrichTree } from '../core/visualController.ts'
import type { LoadHandler } from '../loaders/loadHandler.ts'
import type { VisualTreeNode } from '../types/dataStructure.types.ts'
import * as vscode from 'vscode'

export type VisualCache = NonNullable<ReturnType<typeof createVisualCache>>

export function createVisualCache(
  loader: LoadHandler,
  root: vscode.WorkspaceFolder
) {
  const data = new Map<string, VisualTreeNode[]>()

  const tree = loader.fileTree()
  data.set('inactive', enrichTree(tree, root))

  let activeMergeId = 'inactive'

  return {
    getActiveData() {
      return data.get(activeMergeId)
    },

    getDataById(mergeId: string) {
      return data.get(mergeId)
    },

    setData(mergeId: string, visualTree: VisualTreeNode[]) {
      data.set(mergeId, visualTree)
    },

    setActive(mergeId: string) {
      activeMergeId = mergeId
    }
  }
}
