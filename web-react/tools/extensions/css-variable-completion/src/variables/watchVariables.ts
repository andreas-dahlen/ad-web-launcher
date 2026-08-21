import * as vscode from 'vscode'
import { loadVariables } from './loadVariables'
import { CssVariableCompletionProvider } from '../completion/cssVarCompletionProvider'

export function watchVariables(
  context: vscode.ExtensionContext,
  variablesUri: vscode.Uri,
  provider: CssVariableCompletionProvider,
): void {
  const watcher = vscode.workspace.createFileSystemWatcher(
    variablesUri.fsPath,
  )

  context.subscriptions.push(
    watcher,

    watcher.onDidChange(() => {
      try {
        provider.updateVariables(loadVariables(variablesUri))
      } catch (error) {
        vscode.window.showErrorMessage(
          `[css variable completion] failed to reload variables: ${String(error)}`,
        )
      }
    }),

    watcher.onDidCreate(() => {
      try {
        provider.updateVariables(loadVariables(variablesUri))
      } catch (error) {
        vscode.window.showErrorMessage(
          `[css variable completion] failed to load variables: ${String(error)}`,
        )
      }
    })
  )
}