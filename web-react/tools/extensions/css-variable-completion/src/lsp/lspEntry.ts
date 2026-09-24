import * as vscode from 'vscode'
import { resolveLspPath } from '../config/paths.ts'
import { watchCssSave } from './watchCssSave.ts'


export function lspEntry(
  cascadeRoot: string,
  output: vscode.OutputChannel,
): vscode.Disposable | undefined {
  const lspUri = resolveLspPath(cascadeRoot)

  if (!lspUri) {
    output.appendLine(
      '[css variable completion] could not resolve LSP path.',
    )
    return
  }

  output.appendLine(
    `[css variable completion] lsp path: ${lspUri}`,
  )

  return watchCssSave(lspUri, output)
}