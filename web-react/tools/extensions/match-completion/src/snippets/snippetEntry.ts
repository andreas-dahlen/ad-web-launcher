import * as vscode from 'vscode'
// import { createSnippetProvider } from './createSnippetProvider.ts'
import { parseSnippets } from './parseSnippets.ts'
import { parseSnippetConfig } from './data/parseSnippetConfig.ts'
import { createSnippetProvider } from './createSnippetProvider.ts'
export function snippetEntry(
  output: vscode.OutputChannel,
): vscode.Disposable | null {
  output.appendLine('[snippets] entry')

  const { bindings, file } = parseSnippetConfig(output)

  if (!file) return null

  const snippets = parseSnippets(file, output)


  // output.appendLine('[snippets] parsed')
  // output.appendLine(JSON.stringify(snippets, null, 2))

  if (!bindings || !snippets) return null
  return createSnippetProvider(bindings, snippets, output)
}
