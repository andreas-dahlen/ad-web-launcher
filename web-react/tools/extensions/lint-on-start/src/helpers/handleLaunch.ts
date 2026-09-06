import * as vscode from 'vscode'
import { resolveRunners } from './resolveRunners.ts'
import { runOxlint } from '../runners/runOxlint.ts'
import { resolveRoot } from './resolveRoot.ts'
import { runEslint } from '../runners/runEslint.ts'
// import { runStylelint } from '../runners/runStylelint.ts'

export function handleLaunch(
  output: vscode.OutputChannel,
  diagnostics: vscode.DiagnosticCollection
): void {

  const settings = vscode.workspace.getConfiguration(
    'lintOnStart',
  )

  const projectRoot = resolveRoot(settings, output)
  const allowed = resolveRunners(settings)

  if (allowed.oxlint) {
    runOxlint(projectRoot, output, diagnostics)
  }

  if (allowed.eslint) {
    runEslint(projectRoot, output, diagnostics)
  }

  if (allowed.stylelint) {
    // runStylelint(projectRoot, output, diagnostics)
  }
}