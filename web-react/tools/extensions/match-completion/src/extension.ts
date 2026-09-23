import * as vscode from 'vscode'
import { getConfig } from './config/getConfig.ts'
import { createMatchingTable } from './config/createMatchingTable.ts'
import { createCompletionProvider } from './core/createCompletionProvider.ts'
import { createSnippetProvider } from './core/createSnippetProvider.ts'

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('match Completion')

  context.subscriptions.push(output)

  output.appendLine('[match completion] loaded')

  let runtime: vscode.Disposable | undefined

  const launch = (): void => {
    runtime?.dispose()

    const { languages, snippetBindings, suggestions } = getConfig(output)

    const disposables: vscode.Disposable[] = []

    if (snippetBindings) {
      const bindings = createSnippetProvider(
        snippetBindings,
        output
      )
      disposables.push(bindings)
    }
    if (!languages) {
      output.appendLine(`[match completion] error reading languages. Idle waiting for config changes.`)
      return
    }

    if (suggestions) {
      const matchTable = createMatchingTable(suggestions)
      const completion = createCompletionProvider(
        languages,
        matchTable,
        output)
      disposables.push(completion)
    }


    runtime = vscode.Disposable.from(...disposables)
  }

  launch()

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (!event.affectsConfiguration('matchCompletion')) {
        return
      }

      output.appendLine(
        '[match completion] configuration changed. Relaunching.',
      )

      launch()
    }),
  )
}

export function deactivate(): void { }