import * as vscode from 'vscode'
import { loadTree } from './loadTree.ts'
import type { ActiveSlice, SliceData, TreeNode } from '../types/dataStructure.types.ts'

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

    fileTree(): TreeNode[] {
      return loadTree(root.uri.fsPath)
    },


    getPersistedSliceData(): SliceData {
      return context.workspaceState.get<SliceData>('sliceMaps') ?? {
        maps: [],
        filters: []
      }
    },
    async setPersistedSliceData(data: SliceData): Promise<void> {
      await context.workspaceState.update(
        'sliceMaps',
        data
      )
    },

    getPersistedExclude(): Record<string, boolean> | undefined {
      return context.workspaceState.get<Record<string, boolean>>('localExclude')
    },
    async setPersistedExclude(exclude: Record<string, boolean> | undefined): Promise<void> {
      await context.workspaceState.update(
        'localExclude',
        exclude
      )
    },

    getPersistedActiveConfig(): ActiveSlice | undefined {
      return context.workspaceState.get<ActiveSlice>('activeConfig')
    },

    async setPersistedActiveConfig(recoveryActiveConfig: ActiveSlice | undefined): Promise<void> {
      await context.workspaceState.update(
        'activeConfig',
        recoveryActiveConfig
      )
    }
  }
}