import * as vscode from "vscode"
import { cssLanguages } from '../config/languages.ts'
import { openLspDocument } from './openLspDocument.ts'
import { nudgeCssModule } from './nudgeModule.ts'

export function watchCssSave(
  lspPath: vscode.Uri,
  // output: vscode.OutputChannel,
): vscode.Disposable {
  const watcher = vscode.workspace.createFileSystemWatcher(
    lspPath.fsPath,
  )

  let pendingCssDocument: vscode.TextDocument | undefined

  void openLspDocument(lspPath)

  const saveListener = vscode.workspace.onDidSaveTextDocument(document => {
    if (cssLanguages.every(({ language }) => document.languageId !== language)) {
      return
    }

    pendingCssDocument = document
  })

  const changeListener = watcher.onDidChange(async () => {
    const document = pendingCssDocument
    pendingCssDocument = undefined

    if (!document) return

    await nudgeCssModule(document)
  })

  return vscode.Disposable.from(
    watcher,
    saveListener,
    changeListener,
  )
}