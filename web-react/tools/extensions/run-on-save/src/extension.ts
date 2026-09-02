import * as vscode from 'vscode'
import { resolvePath } from './helpers/resolvePath.ts'
import { handleRun } from './helpers/handleRun.ts'

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('Run on save')
  context.subscriptions.push(output)

  const diagnostics = vscode.languages.createDiagnosticCollection('run-on-save')
  context.subscriptions.push(diagnostics)

  output.appendLine('[Run on save] loaded')

  let runtime: vscode.Disposable | undefined

  const launch = (): void => {
    runtime?.dispose()

    const settings = vscode.workspace.getConfiguration('runOnSave')

    runtime = vscode.workspace.onDidSaveTextDocument(document => {
      output.appendLine(
        `[Run on save] saved: ${document.fileName}`,
      )

      const filePaths = resolvePath(
        settings,
        document.fileName,
        output,
      )

      handleRun(settings, filePaths, output, diagnostics)
    })
  }

  launch()

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {
      if (!event.affectsConfiguration('runOnSave')) {
        return
      }

      output.appendLine(
        '[Run on save] configuration changed. Relaunching.',
      )

      launch()
    }),
  )
}

export function deactivate(): void { }