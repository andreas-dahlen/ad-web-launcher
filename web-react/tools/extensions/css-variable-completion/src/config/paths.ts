import * as vscode from 'vscode'

export function resolveVariablesUri(
  workspaceFolder: vscode.WorkspaceFolder,
): vscode.Uri | undefined {
  const config = vscode.workspace.getConfiguration(
    'cssVariableCompletion',
  )

  const variablesFile = config.get<string>('variablesFile')

  if (!variablesFile) return

  return vscode.Uri.joinPath(
    workspaceFolder.uri,
    ...variablesFile.split('/'),
  )
}

export function resolveLspPath(
  workspaceFolder: vscode.WorkspaceFolder,
): vscode.Uri | undefined {
  const config = vscode.workspace.getConfiguration(
    'cssVariableCompletion',
  )

  const lspFile = config.get<string>('lspFile')

  if (!lspFile) return

  return vscode.Uri.joinPath(
    workspaceFolder.uri,
    ...lspFile.split('/'),
  )
}