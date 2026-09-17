import * as vscode from 'vscode'

import { variableEntry } from './variables/variableEntry.ts'
import { lspEntry } from './lsp/lspEntry.ts'
import { resolveCascadeRoot } from './config/paths.ts'

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('CSS Variable Completion')

  context.subscriptions.push(output)

  output.appendLine('[css variable completion] loaded')

  let runtime: vscode.Disposable | undefined

  const launch = (): void => {
    runtime?.dispose()

    const cascadeRoot = resolveCascadeRoot(output)

    if (!cascadeRoot) {
      output.appendLine(
        '[css variable completion] could not find Cascade.',
      )
      return
    }
    const disposables: vscode.Disposable[] = []

    const variable = variableEntry(cascadeRoot, output)
    const lsp = lspEntry(cascadeRoot, output) //output

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