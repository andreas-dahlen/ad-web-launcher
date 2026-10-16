import * as vscode from 'vscode'

export async function getExplorerSelection(): Promise<vscode.Uri[]> {
  let previousClipboard: string | undefined

  try {
    previousClipboard = await vscode.env.clipboard.readText()

    await vscode.commands.executeCommand('copyFilePath')

    const clipboard = await vscode.env.clipboard.readText()
    if (!clipboard) return []

    const uris: vscode.Uri[] = []

    for (const filePath of clipboard.split(/\r?\n/)) {
      const path = filePath.trim()
      if (!path) continue

      try {
        const uri = vscode.Uri.file(path)
        const stat = await vscode.workspace.fs.stat(uri)

        if ((stat.type & vscode.FileType.Directory) !== 0) {
          uris.push(uri)
        }
      } catch {
        continue
      }
    }

    return uris
  } finally {
    if (previousClipboard !== undefined) {
      try {
        await vscode.env.clipboard.writeText(previousClipboard)
      } catch {
        // Clipboard restoration failed.
      }
    }
  }
}