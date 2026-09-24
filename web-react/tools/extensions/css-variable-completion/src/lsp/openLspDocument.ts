import * as vscode from 'vscode'

export async function openLspDocument(
  lspPath: vscode.Uri,
  output: vscode.OutputChannel
): Promise<void> {
  try {
    await vscode.workspace.openTextDocument(lspPath)
    output.appendLine(
      `[css variable completion] LSP document refreshed`,
    )
  } catch (error) {
    output.appendLine(
      `[css variable completion] failed to open LSP document: ${String(error)}`,
    )
  }
}
