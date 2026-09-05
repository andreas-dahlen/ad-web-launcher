import * as vscode from 'vscode'
import { resolveLspPath } from '../config/paths.ts'
import { watchCssSave } from './watchCssSave.ts'


export function lspEntry(
  workspaceFolder: vscode.WorkspaceFolder,
  // output: vscode.OutputChannel,
): vscode.Disposable | null {
  const lspUri = resolveLspPath(workspaceFolder)

  if (!lspUri) return null

  return watchCssSave(lspUri) //output
}