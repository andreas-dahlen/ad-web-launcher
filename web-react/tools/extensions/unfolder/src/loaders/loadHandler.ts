import * as vscode from 'vscode'

export type LoadHandler = NonNullable<ReturnType<typeof loadHandler>>
export const loadHandler = (
  context: vscode.ExtensionContext,
  output: vscode.OutputChannel,
  root: vscode.WorkspaceFolder | undefined
) => {

  void context
  void output

  return {
    getUserSettings() {
      return vscode.workspace.getConfiguration('unfolder')
    },

    getExcludePatterns(): string[] {
      const config = vscode.workspace.getConfiguration('unfolder')
      return config.get<string[]>('excludePatterns') ?? []
    },

    getFileExcludes(): string[] {
      if (!root) return []

      const config = vscode.workspace.getConfiguration('files', root.uri)
      const excludes = config.get<Record<string, boolean>>('exclude', {})

      return Object.entries(excludes)
        .filter(([, enabled]) => enabled)
        .map(([pattern]) => pattern)
    }
  }
}