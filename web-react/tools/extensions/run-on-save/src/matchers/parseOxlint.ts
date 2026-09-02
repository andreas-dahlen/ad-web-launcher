import * as vscode from 'vscode'

const pattern =
  /^(.+):(\d+):(\d+):\s+(.*)\s+\[(Error|Warning)\/([^\]]+)\]$/

export function parseDiagnostic(
  line: string,
): vscode.Diagnostic | undefined {
  const match = pattern.exec(line)

  if (!match) {
    return
  }

  const lineNumber = Number(match[2]) - 1
  const columnNumber = Number(match[3]) - 1
  const message = match[4]
  const severity = match[5]
  const code = match[6]

  const diagnostic = new vscode.Diagnostic(
    new vscode.Range(
      lineNumber,
      columnNumber,
      lineNumber,
      columnNumber,
    ),
    message,
    severity === 'Error'
      ? vscode.DiagnosticSeverity.Error
      : vscode.DiagnosticSeverity.Warning,
  )

  diagnostic.code = code

  return diagnostic
}