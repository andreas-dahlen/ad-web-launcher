import * as vscode from 'vscode'
import { createCompletionProvider } from './createCompletionProvider.ts'
import { parseCompletionConfig } from './data/parseCompletionConfig.ts'
import { createMatchingTable } from './data/createMatchingTable.ts'

export function completionEntry(output: vscode.OutputChannel): vscode.Disposable | null {

  const { suggestions, languages } = parseCompletionConfig(output)

  if (!suggestions || !languages) return null

  const matchTable = createMatchingTable(suggestions)

  return createCompletionProvider(languages, matchTable, output)

}




//FYI need to make a suggestion autocomplete with the key if the key isn't written in its completion... / and then pressing note shouldn't become /node... it should be //note... also needs to be able to be triggered from indentated startup.