import * as vscode from 'vscode'
import { createSettingsResolver } from './config/resolveSettings.ts'
import { createTerminal } from './terminal/createTerminal.ts'
import { updateStatusBar } from './vscode/statusBar.ts'
import { createCommandSubscriptions } from './vscode/subscriptions.ts'


export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('Token Compiler')
  output.appendLine('Extension loading...')
  const statusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
  )
  let terminal: vscode.Terminal | undefined


  context.subscriptions.push(
    output,
    ...createCommandSubscriptions({
      startCompiler,
      stopCompiler,
      restartCompiler
    }),
    vscode.window.onDidCloseTerminal(closedTerminal => {
      if (closedTerminal !== terminal) {
        return
      }
      output.appendLine('Stopping compiler service')
      terminal = undefined
      updateStatusBar(statusBar, terminal)
    }),

    vscode.workspace.onDidChangeConfiguration(event => {
      if (!event.affectsConfiguration('tokenCompilerVscode')) {
        return
      }
      output.appendLine('Configuration changed')
      restartCompiler()
    }),

    {
      dispose() {
        stopCompiler()
      },
    },
  )

  statusBar.show()
  startCompiler()

  function startCompiler() {
    output.appendLine('Starting compiler service')
    if (terminal) {
      terminal.show()
      return
    }
    const settings = vscode.workspace.getConfiguration(
      'tokenCompilerVscode')

    const resolver = createSettingsResolver(settings, output)

    terminal = createTerminal(
      resolver.getCliSpawnPath(),
      resolver.getProjectRootArg(),
      resolver.getUserOptions(),
    )

    updateStatusBar(statusBar, terminal)
    terminal.show()
  }

  function stopCompiler() {
    output.appendLine('Stopping compiler service')
    terminal?.dispose()
    terminal = undefined
    updateStatusBar(statusBar, terminal)
  }

  function restartCompiler() {
    stopCompiler()
    startCompiler()
  }
}

export function deactivate(): void { }