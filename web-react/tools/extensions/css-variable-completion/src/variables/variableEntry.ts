import { createCssVariableCompletionProvider } from '../completion/cssVarCompletionProvider.ts'
import * as vscode from 'vscode'
import { loadExtensionData } from './loadExtensionData.ts'
import { watchVariables } from './watchVariables.ts'
import { cssLanguages } from '../config/languages.ts'
import { resolveVariablesUri } from '../config/paths.ts'



export function variableEntry(
  cascadeRoot: string,
  output: vscode.OutputChannel,
): vscode.Disposable | null {
  const variablesUri = resolveVariablesUri(cascadeRoot)

  if (!variablesUri) return null

  const data = loadExtensionData(variablesUri)
  const completion = createCssVariableCompletionProvider(data)

  const watcher = watchVariables(
    variablesUri,
    completion.updateExtensionData,
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