import path from 'node:path'
import * as vscode from 'vscode'


export type ResolvedPaths = {
  filePath: string
  projectRoot: string
}
export function resolvePath(
  settings: vscode.WorkspaceConfiguration,
  fileName: string,
  output: vscode.OutputChannel
): ResolvedPaths {

  const projectRoot = getProjectRoot(settings, output)

  return { filePath: path.resolve(projectRoot, fileName), projectRoot }

}


function getProjectRoot(
  settings: vscode.WorkspaceConfiguration,
  output: vscode.OutputChannel,
): string {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]

  if (!workspaceFolder) {
    output.appendLine('[Run on save] ERROR: workspace folder is missing')
    throw new Error('Workspace folder is missing')
  }

  const projectRoot = settings.get<string>('projectRoot')

  if (!projectRoot) {
    output.appendLine('[Run on save] ERROR: projectRoot setting is missing')
    throw new Error('projectRoot setting is missing')
  }

  return vscode.Uri.joinPath(
    workspaceFolder.uri,
    ...projectRoot.split('/'),
  ).fsPath
}