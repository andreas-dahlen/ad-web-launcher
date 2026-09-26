import * as vscode from 'vscode'
import { loadExtensionData } from './loadExtensionData.ts'
import type { ExtensionData } from './variableSchema.ts'

export function watchVariables(
  variablesUri: vscode.Uri,
  updateVariables: (extensionData: ExtensionData) => void,
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
      const extensionData = loadExtensionData(variablesUri)


      updateVariables(extensionData)

      output.appendLine(
        `[css variable completion] updated: ${extensionData.length} variables`,
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