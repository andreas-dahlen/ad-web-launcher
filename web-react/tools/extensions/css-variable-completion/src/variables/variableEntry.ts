import { CssVariableCompletionProvider } from '../completion/cssVarCompletionProvider'
import * as vscode from 'vscode'
import { loadVariables } from './loadVariables'
import { watchVariables } from './watchVariables'
import { cssLanguages } from '../config/languages'
import { resolveVariablesUri } from '../config/paths'



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