import { spawn, type ChildProcess } from 'node:child_process'
import * as vscode from 'vscode'

import { paths } from './config/paths'

export function activate(context: vscode.ExtensionContext): void {

  const workspace = paths.resolveWorkspace()

  const output = vscode.window.createOutputChannel('Token Compiler')

  let compiler: ChildProcess | undefined

  function startCompiler() {

    const cliFile = paths.getCliPath(workspace)
    const tokenFolder = paths.getTokenPath(workspace)
    const outDir = paths.getGeneratedPath(workspace)

    const config = {
      rootDir: workspace.uri.fsPath,
      tokenFolder: tokenFolder.fsPath,
      outDir: outDir.fsPath
    }

    compiler = spawn(
      process.execPath,
      [
        cliFile.fsPath,
        'run',
        JSON.stringify(config),
      ],
    )

    compiler.stdout?.on('data', data => {
      output.append(data.toString())
    })

    compiler.stderr?.on('data', data => {
      output.append(data.toString())
    })
  }

  function stopCompiler() {
    compiler?.kill()
    compiler = undefined
  }

  startCompiler()

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(event => {

      if (!event.affectsConfiguration('tokenCompilerVscode')) {
        return
      }

      stopCompiler()
      startCompiler()
    }),
    {
      dispose() {
        stopCompiler()
      },
    },
  )

  output.show(true)
}

export function deactivate(): void { }