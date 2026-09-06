import * as vscode from 'vscode'

type StylelintWarning = {
  line: number
  column: number
  endLine: number
  endColumn: number
  rule: string
  severity: 'error' | 'warning'
  text: string
}

type StylelintResult = {
  source: string
  warnings: StylelintWarning[]
}

export type ParsedDiagnostics = {
  filePath: string
  diagnostics: vscode.Diagnostic[]
}

export function parseStylelint(
  output: string,
): ParsedDiagnostics[] {
  const results = JSON.parse(output) as StylelintResult[]

  return results.map(result => ({
    filePath: result.source,
    diagnostics: result.warnings.map(warning => {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(
          warning.line - 1,
          warning.column - 1,
          warning.endLine - 1,
          warning.endColumn - 1,
        ),
        warning.text,
        warning.severity === 'error'
          ? vscode.DiagnosticSeverity.Error
          : vscode.DiagnosticSeverity.Warning,
      )

      diagnostic.code = warning.rule
      diagnostic.source = 'Lint on Start'

      return diagnostic
    }),
  }))
}