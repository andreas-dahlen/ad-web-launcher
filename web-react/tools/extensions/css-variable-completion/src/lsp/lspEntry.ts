import * as vscode from 'vscode'
import { resolveLspPath } from '../config/paths'
import { watchCssSave } from './watchCssSave'


export function lspEntry(
  workspaceFolder: vscode.WorkspaceFolder,
  // output: vscode.OutputChannel,
): vscode.Disposable | null {
  const lspUri = resolveLspPath(workspaceFolder)

  if (!lspUri) return null

  return watchCssSave(lspUri) //output
}