import { createCssVariableCompletionProvider } from '../completion/cssVarCompletionProvider.ts'
import * as vscode from 'vscode'
import { loadVariables } from './loadVariables.ts'
import { watchVariables } from './watchVariables.ts'
import { cssLanguages } from '../config/languages.ts'
import { resolveVariablesUri } from '../config/paths.ts'



export function variableEntry(
  cascadeRoot: string,
  output: vscode.OutputChannel,
): vscode.Disposable | null {
  const variablesUri = resolveVariablesUri(cascadeRoot)

  if (!variablesUri) return null

  const variables = loadVariables(variablesUri)
  const completion = createCssVariableCompletionProvider(variables)

  const watcher = watchVariables(
    variablesUri,
    completion.updateVariables,
    output,
  )

  const registration = vscode.languages.registerCompletionItemProvider(
    cssLanguages,
    completion.provider,
    '-',
  )

  return vscode.Disposable.from(
    watcher,
    registration,
  )
}