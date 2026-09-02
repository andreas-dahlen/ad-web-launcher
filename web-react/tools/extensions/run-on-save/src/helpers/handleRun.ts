import * as vscode from 'vscode'
import type { ResolvedPaths } from './resolvePath.ts'
import { resolveRunners } from './resolveRunners.ts'
import { runOxlint } from '../runners/runOxlint.ts'

export async function handleRun(
  settings: vscode.WorkspaceConfiguration,
  filePaths: ResolvedPaths,
  output: vscode.OutputChannel,
  diagnostics: vscode.DiagnosticCollection
): Promise<void> {
  const allowed = resolveRunners(settings, filePaths.filePath)

  if (allowed.oxlint) {
    runOxlint(filePaths, output, diagnostics)
  }

  if (allowed.eslint) {
    // run eslint
  }

  if (allowed.stylelint) {
    // run stylelint
  }
}