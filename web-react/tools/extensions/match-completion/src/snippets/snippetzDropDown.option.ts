// import * as vscode from 'vscode'

// export function createSnippetProvider(
//   bindings: string[],
//   output: vscode.OutputChannel,
// ): vscode.Disposable {
//   output.appendLine(
//     `[matchCompletion] registering snippet binding watcher: ${bindings.join(', ')}`,
//   )

//   const disposable = vscode.workspace.onDidChangeTextDocument(event => {
//     const editor = vscode.window.activeTextEditor

//     if (!editor || event.document !== editor.document) {
//       return
//     }

//     for (const change of event.contentChanges) {
//       if (!change.text) {
//         continue
//       }

//       const position = change.range.start.translate(
//         0,
//         change.text.length,
//       )

//       const line = event.document.lineAt(position.line).text
//       const prefix = line.slice(0, position.character)

//       output.appendLine(
//         `[matchCompletion] text change: "${change.text}" at ${change.range.start.character}`,
//       )

//       const binding = bindings.find(value =>
//         prefix.endsWith(value),
//       )

//       if (!binding) {
//         continue
//       }

//       output.appendLine(
//         `[matchCompletion] snippet binding detected: "${binding}"`,
//       )

//       void vscode.commands.executeCommand(
//         'hideSuggestWidget',
//       ).then(() => {
//         output.appendLine(
//           '[matchCompletion] suggest widget hidden',
//         )

//         return vscode.commands.executeCommand(
//           'editor.action.insertSnippet',
//         )
//       })
//     }
//   })

//   return disposable
// }