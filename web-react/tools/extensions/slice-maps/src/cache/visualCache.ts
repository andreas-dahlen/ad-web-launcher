import type { VisualTreeNode } from '../types/dataStructure.types.ts'
import * as vscode from 'vscode'

export type VisualCache = NonNullable<ReturnType<typeof createVisualCache>>
export function createVisualCache() {
  const data = new Map<string, VisualTreeNode[]>()
  let root: vscode.WorkspaceFolder | undefined

  return {
    getData() {
      return data
    },

    setData(mergeId: string, visualTree: VisualTreeNode[]) {
      data.set(mergeId, visualTree)
    },




    setRoot(saveRoot: vscode.WorkspaceFolder) {
      root = saveRoot
    },

    getRoot() {
      return root
    }
  }
}