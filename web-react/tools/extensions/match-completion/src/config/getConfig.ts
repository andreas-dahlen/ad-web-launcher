import * as vscode from 'vscode'
import type { Config } from '../types/all.types.ts'



export function getConfig(
  output: vscode.OutputChannel
): Config | undefined {

  const settings = vscode.workspace.getConfiguration(
    'matchCompletion',
  )

  const languages = settings.get<string[]>('languages')
  if (!languages) {
    output.appendLine(
      '[matchCompletion] found no languages enabled in settings.json.',
    )
    return
  }

  const suggestions = settings.get<Record<string, string[]>>('suggestions')
  const snippetBindings = settings.get<Record<string, string[]>>('snippetBindings')
  //QUEST extract snippetBindings and create snippetz retrigger from snippetBindings array strings. investrigate how to get snippet information.

  //FYI need to make a suggestion autocomplete with the key if the key isn't written in its completion... / and then pressing note shouldn't become /node... it should be //note... also needs to be able to be triggered from indentated startup.

  if (!suggestions) {
    output.appendLine(
      '[matchCompletion] found no suggestions in settings.json.',
    )
    return
  }

  return {
    languages,
    suggestions
  }
}