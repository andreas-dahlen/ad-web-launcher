import * as vscode from 'vscode'
import { loadTree } from './loadTree.ts'
import type { SliceData, TreeNode } from '../types/dataStructure.types.ts'

export type LoadHandler = NonNullable<ReturnType<typeof loadHandler>>
export const loadHandler = (context: vscode.ExtensionContext, root: vscode.WorkspaceFolder) => {
  return {
    getUserSettings() {
      return vscode.workspace.getConfiguration('SliceMaps')
    },

    getExcludeConfigTarget() {
      return vscode.workspace.getConfiguration('files', root.uri)
    },

    getLocalExclude(): Record<string, boolean> {
      const config = vscode.workspace.getConfiguration('files', root.uri)
      const inspect = config.inspect<Record<string, boolean>>('exclude')
      return inspect?.workspaceFolderValue ?? {}
    },

    sliceData(): SliceData {
      return context.workspaceState.get<SliceData>('sliceMaps') ?? {
        maps: [],
        filters: []
      }
    },

    fileTree(): TreeNode[] {
      return loadTree(root.uri.fsPath)
    }
  }
}