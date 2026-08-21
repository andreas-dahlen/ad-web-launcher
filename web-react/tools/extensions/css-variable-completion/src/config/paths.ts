import * as vscode from 'vscode'

export function resolveVariablesUri(
  workspaceFolder: vscode.WorkspaceFolder,
): vscode.Uri {
  const config = vscode.workspace.getConfiguration(
    'cssVariableCompletion',
  )

  const variablesFile = config.get<string>('variablesFile')

  if (!variablesFile) {
    throw new Error('variablesFile setting is missing')
  }

  return vscode.Uri.joinPath(
    workspaceFolder.uri,
    ...variablesFile.split('/'),
  )
}

export function resolveLspPath(
  workspaceFolder: vscode.WorkspaceFolder,
): vscode.Uri {
  return vscode.Uri.joinPath(
    workspaceFolder.uri,
    'web-react/src/shared/generated/metadata/cssVariables.generated.ts',
  )
}