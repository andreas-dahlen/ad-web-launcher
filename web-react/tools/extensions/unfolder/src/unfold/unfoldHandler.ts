import type { LoadHandler } from '../loaders/loadHandler.ts'
import * as vscode from 'vscode'
import type { Progress } from '../types/core.types.ts'
import { handleProgressReport } from '../core/progressReport.ts'
import { getExplorerSelection } from '../core/getExporerSelection.ts'
import { collectFolders } from '../core/collectFolders.ts'
import { getMatchers } from '../core/getMatchers.ts'
import { filterFolders } from '../core/filterFolders.ts'

export function unfoldHandler(loader: LoadHandler) {

  async function collapse(
    uris: vscode.Uri[]
  ) {

    const filtered = await filterFolders(uris)

    for (const uri of filtered) {
      await vscode.commands.executeCommand('revealInExplorer', uri)
      await vscode.commands.executeCommand('list.collapseAllToFocus')
    }
  }

  async function unfold(
    uris: vscode.Uri[],
    progress: Progress,
    token: vscode.CancellationToken
  ) {
    const { patterns, fileExcludes } = getMatchers(loader)
    for (const uri of uris) {
      if (token.isCancellationRequested) break
      const folders = await collectFolders(uri, token, patterns, fileExcludes)

      const total = folders.length

      for (let i = 0; i < total; i++) {
        if (token.isCancellationRequested) break

        const folder = folders[i]
        if (!folder) continue

        handleProgressReport(folder, i, total, progress)


        if (token.isCancellationRequested) break

        await vscode.commands.executeCommand('revealInExplorer', folder)

        if (token.isCancellationRequested) break

        await vscode.commands.executeCommand('list.expand')
      }
    }
  }

  async function unfoldWithKeybind(
    progress: Progress,
    token: vscode.CancellationToken,
  ) {
    if (token.isCancellationRequested) return

    const uris = await getExplorerSelection()

    if (token.isCancellationRequested || uris.length === 0) return

    await unfold(uris, progress, token)
  }

  return { unfold, unfoldWithKeybind, collapse }
}