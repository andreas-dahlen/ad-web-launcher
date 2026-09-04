import * as vscode from 'vscode'
import { handleLaunch } from './helpers/handleLaunch.ts'

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('Lint on Start')
  context.subscriptions.push(output)

  const diagnostics = vscode.languages.createDiagnosticCollection('lint-on-start')
  context.subscriptions.push(diagnostics)

  output.appendLine('[Lint on Start] loaded')

  const launch = (): void => {
    diagnostics.clear()

    handleLaunch(output, diagnostics)
  }

  launch()

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (!event.affectsConfiguration('lintOnStart')) {
        return
      }

      output.appendLine(
        '[Lint on Start] configuration changed. Relaunching.',
      )

      launch()
    }),

    // vscode.window.onDidChangeActiveTextEditor(editor => {
    //   if (!editor) {
    //     return
    //   }

    //   output.appendLine(
    //     `[Lint on Start] active: ${editor.document.uri.fsPath}`,
    //   )

    //   diagnostics.delete(editor.document.uri)
    // }),

    vscode.workspace.onDidSaveTextDocument(document => {
      // output.appendLine(
      //   `[Lint on Start] saved: ${document.uri.fsPath}`,
      // )

      diagnostics.delete(document.uri)
    })
  )
}

export function deactivate(): void { }