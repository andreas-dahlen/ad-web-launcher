import * as vscode from 'vscode'
import { parseSnippets } from './parseSnippets.ts'
import { parseSnippetConfig } from './data/parseSnippetConfig.ts'
import { createSnippetProvider } from './createSnippetProvider.ts'
export function snippetEntry(
  output: vscode.OutputChannel,
): vscode.Disposable | null {

  const { triggers, file } = parseSnippetConfig(output)

  if (!file) return null

  const snippets = parseSnippets(file, output)

  // output.appendLine(JSON.stringify(snippets, null, 2))

  if (!triggers || !snippets) return null
  return createSnippetProvider(triggers, snippets, output)
}
