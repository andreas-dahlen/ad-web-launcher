import type { PreparedMatches } from '../types/completion.types.ts'
import * as vscode from "vscode"

export function createCompletionProvider(
  languages: string[],
  matchTable: PreparedMatches,
  output: vscode.OutputChannel,
): vscode.Disposable {

  output.appendLine(
    `[match suggestions] registering provider for: ${languages.join(', ')}`,
  )

  output.appendLine(`[match suggestions] keys registered: ${matchTable.byTrigger.values().flatMap(entries => entries.map(entry => entry.matcher)).toArray().join(', ')}`)

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position
    ) {
      const line = document.lineAt(position.line).text
      const prefix = line.slice(0, position.character)
      const trigger = prefix.trimStart().at(0)

      if (!trigger) {
        return new vscode.CompletionList([], true)
      }

      const matches = matchTable.byTrigger.get(trigger) ?? []

      const completions = matches.flatMap(match =>
        match.completions.flatMap(completion => {
          const range = getMatcherRange(
            line,
            position,
            match.matcher,
          )

          if (!range) {
            return []
          }

          const item = new vscode.CompletionItem(
            completion,
            vscode.CompletionItemKind.Text,
          )

          item.filterText = `${match.matcher}${completion}`
          item.insertText = `${match.matcher}${completion}`

          item.range = range

          return item
        }),
      )

      return new vscode.CompletionList(
        completions,
        true,
      )
    },
  }

  const selectors = languages.map(language => ({
    scheme: 'file',
    language,
  }))

  const completion = vscode.languages.registerCompletionItemProvider(
    selectors,
    provider,
    ...matchTable.triggers,
  )

  output.appendLine('[match suggestions] provider registered.')

  return vscode.Disposable.from(completion)
}

function getMatcherRange(
  line: string,
  position: vscode.Position,
  matcher: string,
): vscode.Range | undefined {
  const prefix = line.slice(0, position.character)

  for (let size = Math.min(prefix.length, matcher.length); size > 0; size--) {
    const typed = matcher.slice(0, size)

    if (prefix.endsWith(typed)) {
      return new vscode.Range(
        position.line,
        position.character - size,
        position.line,
        position.character,
      )
    }
  }

  return undefined
}