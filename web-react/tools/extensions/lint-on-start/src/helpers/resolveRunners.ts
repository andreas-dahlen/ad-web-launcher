import * as vscode from 'vscode'

type AllowedRun = {
  oxlint: boolean
}

export function resolveRunners(
  settings: vscode.WorkspaceConfiguration,
): AllowedRun {

  return {
    oxlint: settings.get<boolean>('oxlint', false),
  }
}