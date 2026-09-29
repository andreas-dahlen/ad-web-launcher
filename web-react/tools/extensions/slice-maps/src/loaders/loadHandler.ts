import * as vscode from 'vscode'
import { loadTree } from './loadTree.ts'
import type { SliceMap, TreeNode } from '../types/dataStructure.types.ts'

export type LoadHandler = NonNullable<ReturnType<typeof loadHandler>>
export const loadHandler = (context: vscode.ExtensionContext, root: vscode.WorkspaceFolder) => {
  return {
    getUserSettings() {
      return vscode.workspace.getConfiguration('SliceMaps')
    },

    getExcludeConfig() {
      return vscode.workspace.getConfiguration('files', root.uri)
    },

    exclude(): Record<string, boolean> {
      const config = vscode.workspace.getConfiguration('files', root.uri)
      const inspect = config.inspect<Record<string, boolean>>('exclude')
      return inspect?.workspaceFolderValue ?? {}
    },

    sliceMaps(): SliceMap[] {
      return context.workspaceState.get<SliceMap[]>('sliceMaps') ?? []
    },

    fileTree(): TreeNode {
      return loadTree(root.uri.fsPath)
    }
  }
}