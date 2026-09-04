import * as vscode from 'vscode'

type AllowedRun = {
  oxlint: boolean
  eslint: boolean
  stylelint: boolean
}

export function resolveRunners(
  settings: vscode.WorkspaceConfiguration,
): AllowedRun {

  return {
    oxlint: settings.get<boolean>('oxlint', false),
    eslint: settings.get<boolean>('eslint', false),
    stylelint:
      settings.get<boolean>('stylelint', false),
  }
}