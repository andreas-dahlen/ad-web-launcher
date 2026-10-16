import * as vscode from 'vscode'
import { register } from './vscode/register.ts'
import { createUnfolderService } from './core/unfolderService.ts'

export function activate(context: vscode.ExtensionContext): void {

  // await context.workspaceState.update('Unfolder', undefined)

  const output = vscode.window.createOutputChannel('Unfolder')

  context.subscriptions.push(output)

  const provider = createUnfolderService(context, output)

  register(context, provider, output)

  output.appendLine('[unfolder] loaded')
}

export function deactivate(): void { }