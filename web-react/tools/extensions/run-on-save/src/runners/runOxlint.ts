import { spawn } from 'node:child_process'
import type { ResolvedPaths } from '../helpers/resolvePath.ts'
import * as vscode from 'vscode'
import { parseDiagnostic } from '../matchers/parseOxlint.ts'

export function runOxlint(
  filePaths: ResolvedPaths,
  output: vscode.OutputChannel,
  diagnostics: vscode.DiagnosticCollection
): void {
  const child = spawn(
    'npm',
    ['run', 'oxlint', '--', '--format=unix', filePaths.filePath],
    {
      cwd: filePaths.projectRoot,
    },
  )

  const parsed: vscode.Diagnostic[] = []

  child.stdout.on('data', data => {
    const lines = data.toString().split('\n')

    for (const line of lines) {
      const diagnostic = parseDiagnostic(line)

      if (diagnostic) {
        parsed.push(diagnostic)
      }
    }

    output.append(data.toString())
  })

  child.stdout.on('data', data => {
    output.append(data.toString())
  })

  child.stderr.on('data', data => {
    output.append(data.toString())
  })

  child.on('close', () => {
    diagnostics.set(
      vscode.Uri.file(filePaths.filePath),
      parsed,
    )
  })
}