import * as vscode from 'vscode'

export async function openLspDocument(lspPath: vscode.Uri): Promise<void> {
  try {
    await vscode.workspace.openTextDocument(lspPath);
  } catch (error) {
    console.error(
      `[css variable completion] failed to open LSP document: ${String(error)}`,
    );
  }
}
