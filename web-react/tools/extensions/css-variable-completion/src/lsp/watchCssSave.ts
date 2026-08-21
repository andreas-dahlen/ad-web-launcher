import * as vscode from "vscode"
import { cssLanguages } from '../config/languages'


let pendingCssDocument: vscode.TextDocument | undefined

export function watchCssSave(
  context: vscode.ExtensionContext,
  lspPath: vscode.Uri,
): void {
  const watcher = vscode.workspace.createFileSystemWatcher(
    lspPath.fsPath,
  )

  context.subscriptions.push(
    watcher,

    vscode.workspace.onDidSaveTextDocument(document => {
      if (!cssLanguages.some(({ language }) => document.languageId === language)) {
        return
      }

      pendingCssDocument = document
    }),

    watcher.onDidChange(async () => {
      const document = pendingCssDocument
      pendingCssDocument = undefined

      if (!document) return

      await nudgeCssModule(document)
    }),
  )
}

async function nudgeCssModule(
  document: vscode.TextDocument,
): Promise<void> {
  const editor = vscode.window.visibleTextEditors.find(
    editor => editor.document === document,
  )

  if (!editor) return

  const position = new vscode.Position(0, 0)

  const inserted = await editor.edit(editBuilder => {
    editBuilder.insert(position, ' ')
  })

  if (!inserted) return

  const removed = await editor.edit(editBuilder => {
    editBuilder.delete(
      new vscode.Range(
        position,
        position.translate(0, 1),
      ),
    )
  })

  if (!removed) return

  await document.save()
}