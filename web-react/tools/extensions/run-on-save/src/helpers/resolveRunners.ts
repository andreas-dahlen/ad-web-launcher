import path from 'node:path'
import * as vscode from 'vscode'

type AllowedRun = {
  oxlint: boolean
  eslint: boolean
  stylelint: boolean
}

export function resolveRunners(
  settings: vscode.WorkspaceConfiguration,
  filePath: string,
): AllowedRun {
  const extension = path.extname(filePath)
  const lint = new Set(['.ts', '.js', '.tsx', '.jsx'])
  const style = new Set(['.css', '.scss'])

  return {
    oxlint: settings.get<boolean>('oxlint', true) && lint.has(extension),
    eslint: settings.get<boolean>('eslint', false) && lint.has(extension),
    stylelint:
      settings.get<boolean>('stylelint', false) && style.has(extension),
  }
}