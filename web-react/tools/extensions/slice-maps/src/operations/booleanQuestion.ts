import * as vscode from 'vscode'

export async function booleanQuestion(message: string): Promise<boolean | undefined> {
  const choice = await vscode.window.showInformationMessage(
    message,
    { modal: true },
    'Yes'
  )

  if (choice === 'Yes') return true
}