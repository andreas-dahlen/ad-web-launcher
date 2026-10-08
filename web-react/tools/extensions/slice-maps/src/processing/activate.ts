import * as vscode from 'vscode'

export async function activate(
  localExclude: Record<string, boolean>,
  exclude: Record<string, true>,
  config: vscode.WorkspaceConfiguration
): Promise<void> {

  await config.update(
    'exclude',
    {
      ...localExclude,
      ...exclude,
    },
    vscode.ConfigurationTarget.WorkspaceFolder
  )
}