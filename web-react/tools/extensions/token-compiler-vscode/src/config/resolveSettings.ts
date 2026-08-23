import path from 'node:path'
import * as vscode from 'vscode'

type ResolveSettings = {
  getProjectRootArg(settings: vscode.WorkspaceConfiguration): string
  getTokenFolder(settings: vscode.WorkspaceConfiguration): string
  getCliSpawnPath(settings: vscode.WorkspaceConfiguration): string
  getOutDir(settings: vscode.WorkspaceConfiguration): string
}

export const resolveSettings: ResolveSettings = {

  getCliSpawnPath(settings) {
    const projectRoot = getProjectRoot(settings)

    const cliFile = settings.get<string>('cliFile')

    if (!cliFile) {
      throw new Error('cliFile setting is missing')
    }

    return path.resolve(projectRoot, cliFile)
  },

  getProjectRootArg(settings) {
    const projectRoot = getProjectRoot(settings)
    const cliFile = this.getCliSpawnPath(settings)

    const cliDirectory = path.dirname(cliFile)
    const compilerDirectory = path.dirname(cliDirectory)

    return path.relative(compilerDirectory, projectRoot)
  },

  getTokenFolder(settings) {
    const tokenFolder = settings.get<string>('tokenFolder')

    if (!tokenFolder) {
      throw new Error('tokenFolder setting is missing')
    }

    return tokenFolder
  },

  getOutDir(settings) {
    const outDir = settings.get<string>('outDir')

    if (!outDir) {
      throw new Error('outDir setting is missing')
    }

    return outDir
  },
}

function getProjectRoot(settings: vscode.WorkspaceConfiguration): string {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]

  if (!workspaceFolder) {
    throw new Error('workspace folder is missing')
  }

  const projectRoot = settings.get<string>('projectRoot')

  if (!projectRoot) {
    throw new Error('projectRoot setting is missing')
  }

  return vscode.Uri.joinPath(
    workspaceFolder.uri,
    ...projectRoot.split('/'),
  ).fsPath
}