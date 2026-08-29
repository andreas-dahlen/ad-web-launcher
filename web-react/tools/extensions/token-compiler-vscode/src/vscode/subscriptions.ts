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
      'tokenCompilerVscode.start',
      startCompiler,
    ),

    vscode.commands.registerCommand(
      'tokenCompilerVscode.stop',
      stopCompiler,
    ),

    vscode.commands.registerCommand(
      'tokenCompilerVscode.restart',
      restartCompiler,
    ),
  ]
}