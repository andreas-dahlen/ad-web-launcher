import { spawn, type ChildProcess } from 'node:child_process'
import * as vscode from 'vscode'
import { resolveSettings } from './config/resolveSettings'


export function activate(context: vscode.ExtensionContext): void {

  // const workspace = paths.resolveWorkspace()

  const output = vscode.window.createOutputChannel('Token Compiler')

  let compiler: ChildProcess | undefined

  function startCompiler() {

    const settings = vscode.workspace.getConfiguration(
      'tokenCompilerVscode')

    const cliFile = resolveSettings.getCliSpawnPath(settings)
    const projectRoot = resolveSettings.getProjectRootArg(settings)

    const config = {
      tokenFolder: resolveSettings.getTokenFolder(settings),
      outDir: resolveSettings.getOutDir(settings)
    }

    compiler = spawn(
      process.execPath,
      [
        cliFile,
        'exe',
        projectRoot,
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