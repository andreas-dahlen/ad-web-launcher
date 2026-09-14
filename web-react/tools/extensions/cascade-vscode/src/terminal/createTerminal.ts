
import * as vscode from 'vscode'
import { CompilerTerminal } from './terminal.ts'

export function createTerminal(
  cliFile: string,
  projectRoot: string
): vscode.Terminal {

  const pty = new CompilerTerminal(
    cliFile,
    projectRoot,
  )

  return vscode.window.createTerminal({
    name: 'Cascade Compiler',
    pty,
  })
}