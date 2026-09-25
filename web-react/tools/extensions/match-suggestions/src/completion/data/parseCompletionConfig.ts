import * as vscode from 'vscode'
import { languagesSchema, completionsSchema } from '../../schemas/settingsSchema.ts'
import type { CompletionConfig } from '../../types/completion.types.ts'



export function parseCompletionConfig(
  output: vscode.OutputChannel
): CompletionConfig {

  const settings = vscode.workspace.getConfiguration('matchSuggestions')

  const gotLanguages = settings.get<unknown>('languages')
  const gotCompletions = settings.get<unknown>('completions')

  const parsedLanguages = languagesSchema.safeParse(gotLanguages)
  const parsedCompletions = completionsSchema.safeParse(gotCompletions)


  if (parsedLanguages.error) {
    output.appendLine(
      `[match suggestions] lagunages parsing error ${parsedLanguages.error}`
    )
  }

  if (parsedCompletions.error) {
    output.appendLine(
      `[match suggestions] lagunages parsing error ${parsedCompletions.error}`
    )
  }

  return {
    languages: parsedLanguages.data ?? null,
    completions: parsedCompletions.data ?? null
  }
}