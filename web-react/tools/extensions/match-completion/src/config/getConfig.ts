import * as vscode from 'vscode'
import type { Config } from '../types/all.types.ts'
import { languagesSchema, snippetBindingsSchema, suggestionsSchema } from './settingsSchema.ts'



export function getConfig(
  output: vscode.OutputChannel
): Config {

  const settings = vscode.workspace.getConfiguration('matchCompletion')

  const gotLanguages = settings.get<unknown>('languages')
  const gotSuggestions = settings.get<unknown>('suggestions')
  const gotSnippetBindings = settings.get<unknown>('snippetBindings')

  const parsedLanguages = languagesSchema.safeParse(gotLanguages)
  const parsedSuggestions = suggestionsSchema.safeParse(gotSuggestions)
  const parsedSnippetBindings = snippetBindingsSchema.safeParse(gotSnippetBindings)


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
  if (parsedSnippetBindings.error) {
    output.appendLine(
      `[matchCompletion] lagunages parsing error ${parsedSnippetBindings.error}`
    )
  }



  return {
    languages: parsedLanguages.data ?? null,
    suggestions: parsedSuggestions.data ?? null,
    snippetBindings: parsedSnippetBindings.data ?? null
  }
}

//QUEST extract snippetBindings and create snippetz retrigger from snippetBindings array strings. investrigate how to get snippet information.

//FYI need to make a suggestion autocomplete with the key if the key isn't written in its completion... / and then pressing note shouldn't become /node... it should be //note... also needs to be able to be triggered from indentated startup.