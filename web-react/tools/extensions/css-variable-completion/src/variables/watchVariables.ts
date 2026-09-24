import * as vscode from 'vscode'
import { loadVariables } from './loadVariables.ts'

export function watchVariables(
  variablesUri: vscode.Uri,
  updateVariables: (variables: string[]) => void,
  output: vscode.OutputChannel,
): vscode.Disposable {
  output.appendLine(
    `[css variable completion] watching: ${variablesUri.fsPath}`,
  )

  const watcher = vscode.workspace.createFileSystemWatcher(
    variablesUri.fsPath,
  )

  const reloadVariables = (): void => {
    try {
      const variables = loadVariables(variablesUri)


      updateVariables(variables)

      output.appendLine(
        `[css variable completion] updated: ${variables.length} variables`,
      )
    } catch (error) {
      output.appendLine(
        `[css variable completion] failed to load variables: ${String(error)}`,
      )
    }
  }

  return vscode.Disposable.from(
    watcher,
    watcher.onDidChange(reloadVariables),
    watcher.onDidCreate(reloadVariables),
  )
}