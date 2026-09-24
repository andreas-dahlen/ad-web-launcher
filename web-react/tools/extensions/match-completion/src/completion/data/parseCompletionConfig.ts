import * as vscode from 'vscode'
import { languagesSchema, suggestionsSchema } from '../../schemas/settingsSchema.ts'
import type { CompletionConfig } from '../../types/completion.types.ts'



export function parseCompletionConfig(
  output: vscode.OutputChannel
): CompletionConfig {

  const settings = vscode.workspace.getConfiguration('matchCompletion')

  const gotLanguages = settings.get<unknown>('languages')
  const gotSuggestions = settings.get<unknown>('suggestions')

  const parsedLanguages = languagesSchema.safeParse(gotLanguages)
  const parsedSuggestions = suggestionsSchema.safeParse(gotSuggestions)


  if (parsedLanguages.error) {
    output.appendLine(
      `[matchCompletion] lagunages parsing error ${parsedLanguages.error}`
    )
  }

  if (parsedSuggestions.error) {
    output.appendLine(
      `[matchCompletion] lagunages parsing error ${parsedSuggestions.error}`
    )
  }

  return {
    languages: parsedLanguages.data ?? null,
    suggestions: parsedSuggestions.data ?? null
  }
}