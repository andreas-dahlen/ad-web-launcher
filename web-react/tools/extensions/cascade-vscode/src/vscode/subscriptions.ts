import * as vscode from 'vscode'

type CompilerActions = {
  startCompiler(): void
  stopCompiler(): void
  restartCompiler(): void
}
export function createCommandSubscriptions({
  startCompiler,
  stopCompiler,
  restartCompiler,
}: CompilerActions): vscode.Disposable[] {
  return [
    vscode.commands.registerCommand(
      'cascade.start',
      startCompiler,
    ),

    vscode.commands.registerCommand(
      'cascade.stop',
      stopCompiler,
    ),

    vscode.commands.registerCommand(
      'cascade.restart',
      restartCompiler,
    ),
  ]
}