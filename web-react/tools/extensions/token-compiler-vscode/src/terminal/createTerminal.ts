
import * as vscode from 'vscode'
import { CompilerTerminal } from './terminal.ts'
import type { UserOptions } from './terminal.types.ts'

export function createTerminal(
  cliFile: string,
  projectRoot: string,
  config: UserOptions,
): vscode.Terminal {

  const pty = new CompilerTerminal(
    cliFile,
    projectRoot,
    config,
  )

  return vscode.window.createTerminal({
    name: 'Token Compiler',
    pty,
  })
}