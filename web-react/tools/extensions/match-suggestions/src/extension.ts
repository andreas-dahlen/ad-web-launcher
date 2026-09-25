import * as vscode from 'vscode'
import { snippetEntry } from './snippets/snippetEntry.ts'
import { completionEntry } from './completion/completionEntry.ts'
import { parseSnippetConfig } from './snippets/data/parseSnippetConfig.ts'


export function activate(context: vscode.ExtensionContext): void {
  vscode.window.showInformationMessage('match-completion activated')
  const output = vscode.window.createOutputChannel('match Suggestions')

  context.subscriptions.push(output)

  output.appendLine('[match suggestions] loaded')

  let runtime: vscode.Disposable | undefined

  const launch = (): void => {
    runtime?.dispose()

    const disposables: vscode.Disposable[] = []

    const completion = completionEntry(output)
    const snippetz = snippetEntry(output)

    if (completion) {
      disposables.push(completion)
    }
    if (snippetz) {
      disposables.push(snippetz)
    }

    runtime = vscode.Disposable.from(...disposables)
  }

  launch()

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (!event.affectsConfiguration('match suggestions')) {
        return
      }

      output.appendLine(
        '[match suggestions] configuration changed. Relaunching.'
      )

      launch()
    }),

  )

  const snippetFile = parseSnippetConfig(output).file

  if (snippetFile) {
    context.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(document => {
        if (document.uri.fsPath !== snippetFile) {
          return
        }

        output.appendLine(
          '[match suggestions] snippets saved. Relaunching.'
        )

        launch()
      }),
    )
  }
}

export function deactivate(): void { }