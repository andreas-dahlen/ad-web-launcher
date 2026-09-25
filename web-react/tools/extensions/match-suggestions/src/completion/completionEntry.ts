import * as vscode from 'vscode'
import { createCompletionProvider } from './createCompletionProvider.ts'
import { parseCompletionConfig } from './data/parseCompletionConfig.ts'
import { createMatchingTable } from './data/createMatchingTable.ts'

export function completionEntry(output: vscode.OutputChannel): vscode.Disposable | null {

  const { completions, languages } = parseCompletionConfig(output)

  if (!completions || !languages) return null

  const matchTable = createMatchingTable(completions)

  return createCompletionProvider(languages, matchTable, output)

}