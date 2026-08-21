import * as vscode from 'vscode'

import { cssLanguages } from './config/languages'
import { resolveVariablesUri, resolveLspPath } from './config/paths'

import { CssVariableCompletionProvider } from './completion/cssVarCompletionProvider'

import { loadVariables } from './variables/loadVariables'
import { watchVariables } from './variables/watchVariables'

import { watchCssSave } from './lsp/watchCssSave'

export function activate(context: vscode.ExtensionContext): void {
  vscode.window.showInformationMessage(
    '[css variable completion loaded]',
  )

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]


  if (!workspaceFolder) {
    vscode.window.showErrorMessage(
      '[css variable completion] no workspace folder',
    )
    return
  }

  const variablesUri = resolveVariablesUri(workspaceFolder)

  const variables = loadVariables(variablesUri)
  const provider = new CssVariableCompletionProvider(variables)

  watchVariables(context, variablesUri, provider)
  watchCssSave(context, resolveLspPath(workspaceFolder))


  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      cssLanguages,
      provider,
      '-',
    ),
  )

  vscode.window.showInformationMessage(
    '[css variable completion] provider registered',
  )
}

export function deactivate(): void { }
