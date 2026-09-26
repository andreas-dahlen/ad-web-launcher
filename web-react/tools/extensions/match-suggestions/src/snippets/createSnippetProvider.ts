import * as vscode from 'vscode'
import type { Snippet, Snippets } from '../types/snippet.types.ts'
import picomatch from 'picomatch'

export function createSnippetProvider(
  triggers: string[],
  snippetz: Snippets,
  output: vscode.OutputChannel,
): vscode.Disposable {
  output.appendLine(
    `[match suggestions] registered snippet provider: ${triggers.join(', ')}`,
  )

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(
      document,
      position
    ) {

      const filePath = document.uri.fsPath
      const snippets = Object.entries(snippetz)

      const matchingSnippets = snippets.filter(([_, snippet]) =>
        isMatchForSnippetFile(snippet, filePath)
      )

      const line = document.lineAt(position.line).text
      const beforeCursor = line.slice(0, position.character)

      return matchingSnippets.flatMap(([name, snippet]) => {
        return triggers.map(trigger => {
          const item = new vscode.CompletionItem(
            name,
            vscode.CompletionItemKind.Snippet
          )

          item.filterText = `${trigger}${name}`
          item.insertText = new vscode.SnippetString(
            snippet.body.join('\n')
          )

          if (trigger !== beforeCursor) {
            item.sortText = `zzz-${name}`
          }

          return item
        })
      })
    }
  }

  const completion =
    vscode.languages.registerCompletionItemProvider(
      { scheme: 'file' },
      provider,
      ...triggers
    )

  // output.appendLine(
  //   '[match suggestions] snippet test provider registered.'
  // )

  return vscode.Disposable.from(completion)
}

function isMatchForSnippetFile(
  snippet: Snippet,
  filePath: string,
): boolean {
  const included =
    !snippet.include ||
    snippet.include.some(pattern => picomatch(pattern)(filePath))

  const excluded =
    snippet.exclude?.some(pattern => picomatch(pattern)(filePath))

  return included && !excluded
}