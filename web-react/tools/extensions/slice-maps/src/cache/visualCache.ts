import type { TreeNode } from '../types/dataStructure.types.ts'
import * as vscode from 'vscode'
type VisualData = {
  data: TreeNode[]
}
export type VisualCache = NonNullable<ReturnType<typeof createVisualCache>>
export function createVisualCache() {
  let isEnabled = false
  let data: VisualData | undefined
  let root: vscode.WorkspaceFolder | undefined

  return {
    isEnabled() {
      return isEnabled
    },

    getData() {
      return data
    },

    setEnabled(willBeEnabled: boolean) {
      isEnabled = willBeEnabled
    },

    setData(value: VisualData | undefined) {
      data = value
    },


    setRoot(saveRoot: vscode.WorkspaceFolder) {
      root = saveRoot
    },

    getRoot() {
      return root
    }
  }
}