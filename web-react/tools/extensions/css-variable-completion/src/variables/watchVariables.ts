import * as vscode from 'vscode'
import { loadVariables } from './loadVariables.ts'
import { CssVariableCompletionProvider } from '../completion/cssVarCompletionProvider.ts'

export function watchVariables(
  variablesUri: vscode.Uri,
  provider: CssVariableCompletionProvider,
  output: vscode.OutputChannel,
): vscode.Disposable {
  output.appendLine(
    `[css variable completion] watching: ${variablesUri.fsPath}`,
  )

  const watcher = vscode.workspace.createFileSystemWatcher(
    variablesUri.fsPath,
  )

  const reloadVariables = (): void => {
    output.appendLine(
      `[css variable completion] variables changed: ${variablesUri.fsPath}`,
    )

    try {
      const variables = loadVariables(variablesUri)

      output.appendLine(
        `[css variable completion] loaded ${variables.length} variables`,
      )

      provider.updateVariables(variables)

      output.appendLine(
        `[css variable completion] provider updated`,
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