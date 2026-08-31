import * as vscode from 'vscode'
export async function nudgeCssModule(
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