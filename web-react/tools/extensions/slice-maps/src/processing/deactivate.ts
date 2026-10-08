import * as vscode from 'vscode'

export async function deactivate(
  localExclude: Record<string, boolean>,
  config: vscode.WorkspaceConfiguration
): Promise<void> {
  await config.update(
    'exclude',
    localExclude,
    vscode.ConfigurationTarget.WorkspaceFolder
  )
}