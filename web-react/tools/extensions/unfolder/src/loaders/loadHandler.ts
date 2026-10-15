import * as vscode from 'vscode'
import { loadTree } from './loadTree.ts'

export type LoadHandler = NonNullable<ReturnType<typeof loadHandler>>
export const loadHandler = (
  context: vscode.ExtensionContext,
  root: vscode.WorkspaceFolder,
  output: vscode.OutputChannel
) => {
  return {
    getUserSettings() {
      return vscode.workspace.getConfiguration('unfolder')
    },

    getFileExcludes(): ExclusionFileData {
      const config = vscode.workspace.getConfiguration('files', root.uri)

      const totalExclude = config.get<Record<string, boolean>>('exclude', {})
      return totalExclude
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

    getPersistedExclude(): ExclusionFileData | undefined {
      return context.workspaceState.get<ExclusionFileData>('excludeSnapshots')
    },
    async setPersistedExclude(exclude: ExclusionFileData | undefined): Promise<void> {
      await context.workspaceState.update(
        'excludeSnapshots',
        exclude
      )
    }
  }
}