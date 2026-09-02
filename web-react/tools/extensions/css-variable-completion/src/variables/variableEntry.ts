import { CssVariableCompletionProvider } from '../completion/cssVarCompletionProvider.ts'
import * as vscode from 'vscode'
import { loadVariables } from './loadVariables.ts'
import { watchVariables } from './watchVariables.ts'
import { cssLanguages } from '../config/languages.ts'
import { resolveVariablesUri } from '../config/paths.ts'



export function variableEntry(
  workspaceFolder: vscode.WorkspaceFolder,
  output: vscode.OutputChannel,
): vscode.Disposable | null {
  const variablesUri = resolveVariablesUri(workspaceFolder)

  if (!variablesUri) return null

  const variables = loadVariables(variablesUri)
  const provider = new CssVariableCompletionProvider(variables)

  const watcher = watchVariables(
    variablesUri,
    provider,
    output,
  )

  const completion = vscode.languages.registerCompletionItemProvider(
    cssLanguages,
    provider,
    '-',
  )

  return vscode.Disposable.from(
    watcher,
    completion,
  )
}