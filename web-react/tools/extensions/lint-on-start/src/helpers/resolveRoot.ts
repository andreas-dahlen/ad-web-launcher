import * as vscode from 'vscode'

export function resolveRoot(
  settings: vscode.WorkspaceConfiguration,
  output: vscode.OutputChannel
): string {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]

  if (!workspaceFolder) {
    output.appendLine(
      '[Lint on Start] ERROR: workspace folder is missing',
    )
    throw new Error('Workspace folder is missing')
  }

  const projectRoot = settings.get<string>('projectRoot')

  if (!projectRoot) {
    output.appendLine(
      '[Lint on Start] ERROR: projectRoot setting is missing',
    )
    throw new Error('projectRoot setting is missing')
  }

  return vscode.Uri.joinPath(
    workspaceFolder.uri,
    ...projectRoot.split('/'),
  ).fsPath
}