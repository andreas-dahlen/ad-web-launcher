import path from 'node:path'
import { spawn } from 'node:child_process'
import * as vscode from 'vscode'

import { parseESLint } from '../matchers/parseEslint.ts'

export function runEslint(
  projectRoot: string,
  output: vscode.OutputChannel,
  diagnostics: vscode.DiagnosticCollection,
): void {
  const child = spawn(
    'npm',
    ['run', 'eslint', '--', '--format=json'],
    {
      cwd: projectRoot,
    },
  )

  let stdout = ''

  child.stdout.on('data', data => {
    stdout += data.toString()
  })

  child.stderr.on('data', data => {
    output.append(data.toString())
  })

  child.on('close', () => {
    const parsed = parseESLint(stdout)

    let problemCount = 0

    for (const result of parsed) {
      const filePath = path.resolve(
        projectRoot,
        result.filePath,
      )

      diagnostics.set(
        vscode.Uri.file(filePath),
        result.diagnostics,
      )

      problemCount += result.diagnostics.length
    }

    output.appendLine(
      `eslint: ${problemCount} problem${problemCount === 1 ? '' : 's'}`,
    )
  })
}