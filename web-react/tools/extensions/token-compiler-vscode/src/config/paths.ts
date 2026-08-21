import * as vscode from 'vscode'



type Paths = {
  resolveWorkspace(): vscode.WorkspaceFolder
  getTokenPath(workspaceFolder: vscode.WorkspaceFolder): vscode.Uri
  getCliPath(workspaceFolder: vscode.WorkspaceFolder): vscode.Uri
  getGeneratedPath(workspaceFolder: vscode.WorkspaceFolder): vscode.Uri
}

export const paths: Paths = {

  resolveWorkspace(): vscode.WorkspaceFolder {

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0]
    if (!workspaceFolder) {
      vscode.window.showErrorMessage(
        '[Token Compiler Vscode] no workspace folder',
      )
      throw new Error('workspace folder is missing')
    }
    return workspaceFolder
  },

  getTokenPath(workspaceFolder: vscode.WorkspaceFolder) {
    const config = vscode.workspace.getConfiguration(
      'tokenCompilerVscode'
    )
    const tokenFolder = config.get<string>('tokenFolder')

    if (!tokenFolder) {
      throw new Error('tokenFolder setting is missing')
    }
    return vscode.Uri.joinPath(
      workspaceFolder.uri,
      ...tokenFolder.split('/'),
    )
  },

  getCliPath(workspaceFolder: vscode.WorkspaceFolder) {
    const config = vscode.workspace.getConfiguration(
      'tokenCompilerVscode'
    )
    const cliFile = config.get<string>('cliFile')
    if (!cliFile) {
      throw new Error('cliFile setting is missing')
    }
    return vscode.Uri.joinPath(
      workspaceFolder.uri,
      ...cliFile.split('/'),
    )
  },

  getGeneratedPath(workspaceFolder: vscode.WorkspaceFolder) {
    const config = vscode.workspace.getConfiguration(
      'tokenCompilerVscode'
    )
    const outDir = config.get<string>('outDir')
    if (!outDir) {
      throw new Error('outDir setting is missing')
    }
    return vscode.Uri.joinPath(
      workspaceFolder.uri,
      ...outDir.split('/'),
    )
  }
}