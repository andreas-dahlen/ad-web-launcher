import type { PreparedMatches } from '../types/all.types.ts';
import * as vscode from 'vscode'
export function createCompletionProvider(
  languages: string[],
  matchTable: PreparedMatches,
  output: vscode.OutputChannel,
): vscode.Disposable | null {

  output.appendLine(
    `[matchCompletion] registering provider for: ${languages.join(', ')}`,
  )

  output.appendLine(
    `[matchCompletion] triggers: ${matchTable.triggers.join(', ')}`,
  )

  const provider: vscode.CompletionItemProvider = {
    provideCompletionItems(
      document: vscode.TextDocument,
      position: vscode.Position,
    ) {
      const line = document.lineAt(position.line).text
      const prefix = line.slice(0, position.character)
      const trigger = prefix.at(-1)

      output.appendLine(
        `[matchCompletion] completion requested: "${prefix}"`,
      )

      if (!trigger) {
        output.appendLine(
          '[matchCompletion] no trigger character.',
        )
        return
      }

      const matches = matchTable.byTrigger.get(trigger)

      if (!matches) {
        output.appendLine(
          `[matchCompletion] no matches for trigger "${trigger}".`,
        )
        return
      }

      output.appendLine(
        `[matchCompletion] checking ${matches.length} match(es) for "${trigger}".`,
      )

      const completes: vscode.CompletionItem[] = []

      for (const match of matches) {
        if (!prefix.endsWith(match.matcher)) {
          output.appendLine(
            `[matchCompletion] no match: "${match.matcher}".`,
          )
          continue
        }

        output.appendLine(
          `[matchCompletion] matched: "${match.matcher}".`,
        )

        for (const suggestion of match.suggestions) {
          completes.push(
            new vscode.CompletionItem(
              suggestion,
              vscode.CompletionItemKind.Text,
            ),
          )
        }
      }

      output.appendLine(
        `[matchCompletion] returning ${completes.length} completion(s).`,
      )

      return completes
    },
  }

  const completion = vscode.languages.registerCompletionItemProvider(
    languages,
    provider,
    ...matchTable.triggers,
  )

  return vscode.Disposable.from(completion)
}
