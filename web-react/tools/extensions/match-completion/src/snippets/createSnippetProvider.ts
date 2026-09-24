import * as vscode from 'vscode'
import type { Snippets } from '../types/snippet.types.ts'

export function createSnippetProvider(
  bindings: string[],
  snippetz: Snippets,
  output: vscode.OutputChannel,
): vscode.Disposable {
  output.appendLine(
    `[matchCompletion] registering snippet test provider: ${bindings.join(', ')}`,
  )

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems() {
      output.appendLine(
        '[matchCompletion] providing test snippet',
      )

      const snippets = Object.entries(snippetz)

      return bindings.flatMap(binding =>
        snippets.map(([name, snippet]) => {
          const item = new vscode.CompletionItem(
            name,
            vscode.CompletionItemKind.Snippet
          )

          item.filterText = binding
          item.insertText = new vscode.SnippetString(
            snippet.body.join('\n')
          )

          return item
        })
      )
    }
  }

  const selectors = [
    { scheme: 'file', language: 'typescript' },
    { scheme: 'file', language: 'javascript' },
  ]

  const completion =
    vscode.languages.registerCompletionItemProvider(
      selectors,
      provider,
      ...bindings,
    )

  output.appendLine(
    '[matchCompletion] snippet test provider registered.',
  )

  return vscode.Disposable.from(completion)
}