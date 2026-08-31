import * as vscode from 'vscode'

import { variableEntry } from './variables/variableEntry'
import { lspEntry } from './lsp/lspEntry'

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('CSS Variable Completion')

  context.subscriptions.push(output)

  output.appendLine('[css variable completion] loaded')

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]

  if (!workspaceFolder) {
    output.appendLine(
      '[css variable completion] no workspace folder. Shutting down.',
    )
    return
  }

  let runtime: vscode.Disposable | undefined

  const launch = (): void => {
    runtime?.dispose()

    const disposables: vscode.Disposable[] = []

    const variable = variableEntry(workspaceFolder, output)
    const lsp = lspEntry(workspaceFolder) //output

    if (variable) disposables.push(variable)
    if (lsp) disposables.push(lsp)

    runtime = vscode.Disposable.from(...disposables)
  }

  launch()

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (!event.affectsConfiguration('cssVariableCompletion')) {
        return
      }

      output.appendLine(
        '[css variable completion] configuration changed. Relaunching.',
      )

      launch()
    }),
  )
}

export function deactivate(): void { }