import path from 'node:path'
import * as vscode from 'vscode'
import type { UserOptions } from '../terminal/terminal.types'

export function createSettingsResolver(settings: vscode.WorkspaceConfiguration, output: vscode.OutputChannel) {
  const projectRoot = getProjectRoot(settings, output)

  const cliFile = settings.get<string>('cliFile')

  if (!cliFile) {
    output.appendLine('ERROR: cliFile setting is missing')
    throw new Error(' ')
  }

  const cliPath = path.resolve(projectRoot, cliFile)
  const compilerDirectory = path.dirname(path.dirname(cliPath))

  return {
    getCliSpawnPath(): string {
      return cliPath
    },

    getProjectRootArg(): string {
      return path.relative(compilerDirectory, projectRoot)
    },

    getUserOptions(): UserOptions {
      return {
        tokenFolder: settings.get<string>('tokenFolder'),
        outDir: settings.get<string>('outDir'),
        mute: settings.get<boolean>('mute'),
      }
    }
  }
}



function getProjectRoot(settings: vscode.WorkspaceConfiguration, output: vscode.OutputChannel): string {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]

  if (!workspaceFolder) {
    output.appendLine('ERROR: workspace folder is missing')
    throw new Error(" ")
  }

  const projectRoot = settings.get<string>('projectRoot')

  if (!projectRoot) {
    output.appendLine('ERROR: projectRoot setting is missing')
    throw new Error(' ')
  }

  return vscode.Uri.joinPath(
    workspaceFolder.uri,
    ...projectRoot.split('/'),
  ).fsPath
}