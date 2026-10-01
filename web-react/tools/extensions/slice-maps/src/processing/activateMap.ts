import * as vscode from 'vscode'

export async function activateMap(
  localExclude: Record<string, boolean>,
  exclude: Map<string, boolean>,
  config: vscode.WorkspaceConfiguration
): Promise<void> {
  const resolvedExclude: Record<string, boolean> = {}

  for (const [path, value] of exclude) {
    if (value) {
      resolvedExclude[path] = true
    }
  }

  await config.update(
    'exclude',
    {
      ...localExclude,
      ...resolvedExclude,
    },
    vscode.ConfigurationTarget.WorkspaceFolder
  )
}