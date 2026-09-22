import type { PreparedMatches } from '../types/all.types.ts'
import * as vscode from "vscode"

export function createCompletionProvider(
  languages: string[],
  matchTable: PreparedMatches,
  output: vscode.OutputChannel,
): vscode.Disposable {

  output.appendLine(
    `[matchCompletion] registering provider for: ${languages.join(', ')}`,
  )

  output.appendLine(`[matchCompletion] keys registered: ${matchTable.byTrigger.values().flatMap(entries => entries.map(entry => entry.matcher)).toArray().join(', ')}`)

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position
    ) {
      const line = document.lineAt(position.line).text
      const prefix = line.slice(0, position.character)
      const trigger = prefix.at(0)

      if (!trigger) {
        return new vscode.CompletionList([], true)
      }

      const matches = matchTable.byTrigger.get(trigger) ?? []

      const completions = matches.flatMap(match =>
        match.suggestions.map(suggestion => {
          const completion = new vscode.CompletionItem(
            suggestion,
            vscode.CompletionItemKind.Text,
          )

          completion.insertText = suggestion
          completion.filterText = match.matcher

          return completion
        }),
      )

      output.appendLine(
        `[matchCompletion] returning: ${completions
          .map(completion => completion.label)
          .join(', ')}`,
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

  output.appendLine('[matchCompletion] provider registered.')

  return vscode.Disposable.from(completion)
}
