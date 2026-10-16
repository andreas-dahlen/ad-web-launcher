import * as vscode from 'vscode'
import { loadHandler } from '../loaders/loadHandler.ts'
import { unfoldHandler } from '../unfold/unfoldHandler.ts'
import { progressHandler } from '../vscode/progressHandler.ts'

export type UnfolderService = NonNullable<ReturnType<typeof createUnfolderService>>
export function createUnfolderService(
  context: vscode.ExtensionContext,
  output: vscode.OutputChannel) {

  const root = vscode.workspace.workspaceFolders?.[0]
  const loader = loadHandler(context, output, root)

  const progress = progressHandler()

  const unfold = unfoldHandler(loader)

  return {
    ...unfold,
    progress
  }
}