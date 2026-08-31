import * as vscode from 'vscode'
import { loadVariables } from './loadVariables'
import { CssVariableCompletionProvider } from '../completion/cssVarCompletionProvider'

export function watchVariables(
  variablesUri: vscode.Uri,
  provider: CssVariableCompletionProvider,
  output: vscode.OutputChannel,
): vscode.Disposable {
  const watcher = vscode.workspace.createFileSystemWatcher(
    variablesUri.fsPath,
  )

  const reloadVariables = (): void => {
    try {
      provider.updateVariables(loadVariables(variablesUri))
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