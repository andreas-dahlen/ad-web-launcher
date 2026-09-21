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