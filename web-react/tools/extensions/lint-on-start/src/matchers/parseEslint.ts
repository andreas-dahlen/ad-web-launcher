import * as vscode from 'vscode'

type ESLintMessage = {
  line: number
  column: number
  endLine?: number
  endColumn?: number
  severity: 1 | 2
  message: string
  ruleId: string | null
}

type ESLintFileResult = {
  filePath: string
  messages: ESLintMessage[]
}

export type ParsedDiagnostics = {
  filePath: string
  diagnostics: vscode.Diagnostic[]
}

export function parseESLint(
  output: string,
): ParsedDiagnostics[] {
  const results = JSON.parse(output) as ESLintFileResult[]

  return results.map(result => ({
    filePath: result.filePath,
    diagnostics: result.messages.map(message => {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(
          message.line - 1,
          message.column - 1,
          (message.endLine ?? message.line) - 1,
          (message.endColumn ?? message.column) - 1,
        ),
        message.message,
        message.severity === 2
          ? vscode.DiagnosticSeverity.Error
          : vscode.DiagnosticSeverity.Warning,
      )

      diagnostic.code = message.ruleId ?? undefined
      diagnostic.source = 'Lint on Start'

      return diagnostic
    }),
  }))
}