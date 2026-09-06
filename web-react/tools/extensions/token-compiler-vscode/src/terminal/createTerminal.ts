
import * as vscode from 'vscode'
import { CompilerTerminal } from './terminal.ts'

export function createTerminal(
  cliFile: string,
  projectRoot: string,
  tokenFolder: string | undefined,
): vscode.Terminal {

  const pty = new CompilerTerminal(
    cliFile,
    projectRoot,
    tokenFolder,
  )

  return vscode.window.createTerminal({
    name: 'Token Compiler',
    pty,
  })
}