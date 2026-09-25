import * as vscode from 'vscode'
import type { Snippets } from '../types/snippet.types.ts'
import picomatch from 'picomatch'

export function createSnippetProvider(
  bindings: string[],
  snippetz: Snippets,
  output: vscode.OutputChannel,
): vscode.Disposable {
  output.appendLine(
    `[matchCompletion] registering snippet test provider: ${bindings.join(', ')}`,
  )

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(
      document
    ) {
      output.appendLine(
        '[matchCompletion] providing test snippet',
      )

      const filePath = document.uri.fsPath
      const snippets = Object.entries(snippetz)

      const matchingSnippets = snippets.filter(([_, snippet]) =>
        !snippet.include ||
        snippet.include.some(pattern => picomatch(pattern)(filePath))
      )


      return matchingSnippets.flatMap(([name, snippet]) => {
        return bindings.map(binding => {
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
      })
    }
  }

  const completion =
    vscode.languages.registerCompletionItemProvider(
      { scheme: 'file' },
      provider,
      ...bindings
    )

  output.appendLine(
    '[matchCompletion] snippet test provider registered.'
  )

  return vscode.Disposable.from(completion)
}