import * as vscode from 'vscode'
import { loadTree } from './loadTree.ts'
import type { ActiveSlice, SliceData, TreeNode } from '../types/core.types.ts'
import type { ExclusionFileData, OverrideBehavior } from '../types/vscode.types.ts'
// import picomatch from 'picomatch'

export type LoadHandler = NonNullable<ReturnType<typeof loadHandler>>
export const loadHandler = (
  context: vscode.ExtensionContext,
  root: vscode.WorkspaceFolder,
  output: vscode.OutputChannel
) => {
  return {
    getUserSettings() {
      return vscode.workspace.getConfiguration('sliceMaps')
    },

    getBehavior(): OverrideBehavior {
      return vscode.workspace
        .getConfiguration('sliceMaps')
        .get<OverrideBehavior>('behavior', 'recursive')
    },

    getExcludeConfigTarget() {
      return vscode.workspace.getConfiguration('files', root.uri)
    },

    getFileExcludes(): ExclusionFileData {
      const config = vscode.workspace.getConfiguration('files', root.uri)
      const localExclude = config.inspect<Record<string, boolean>>('exclude')
      const totalExclude = config.get<Record<string, boolean>>('exclude', {})
      return {
        local: localExclude?.workspaceFolderValue ?? {},
        total: totalExclude
      }
    },

    fileTree(totalExclude: ExclusionFileData['total']): TreeNode[] {
      // const exclude = vscode.workspace
      //   .getConfiguration('files', root.uri)
      //   .get<Record<string, boolean>>('exclude', {})

      output.appendLine(
        `[slice maps] files.exclude: ${JSON.stringify(totalExclude, null, 2)}`
      )

      const loadedTree = loadTree(root.uri.fsPath, totalExclude)
      output.appendLine(
        `[slice maps] fileTree: ${JSON.stringify(loadedTree, null, 2)}`
      )

      return loadedTree
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

    getPersistedExclude(): ExclusionFileData | undefined {
      return context.workspaceState.get<ExclusionFileData>('excludeSnapshots')
    },
    async setPersistedExclude(exclude: ExclusionFileData | undefined): Promise<void> {
      await context.workspaceState.update(
        'excludeSnapshots',
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