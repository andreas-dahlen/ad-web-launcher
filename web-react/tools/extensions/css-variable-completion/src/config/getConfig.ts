import path from 'node:path'
import * as vscode from 'vscode'


export function getConfig(
  output: vscode.OutputChannel
): string | undefined {
  const workspaceFolder =
    vscode.workspace.workspaceFolders?.[0]

  if (!workspaceFolder) {
    output.appendLine(
      '[css variable completion] no workspace folder.',
    )
    return
  }
  const settings = vscode.workspace.getConfiguration(
    'cssVariableCompletion',
  )
  const rootSetting = settings.get<string>('nodeModulesRoot')

  if (!rootSetting) {
    output.appendLine(
      '[css variable completion] nodeModulesRoot is missing.',
    )
    return
  }

  return path.resolve(
    workspaceFolder.uri.fsPath,
    rootSetting
  )
}