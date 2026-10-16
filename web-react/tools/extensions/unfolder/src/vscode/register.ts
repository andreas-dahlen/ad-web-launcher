import * as vscode from 'vscode'
import type { UnfolderService } from '../core/unfolderService.ts'
import { getExplorerSelection } from '../core/getExporerSelection.ts'
export function register(
  context: vscode.ExtensionContext,
  service: UnfolderService,
  output: vscode.OutputChannel
) {
  async function safe(
    name: string,
    action: () => Promise<void> | void
  ): Promise<void> {
    try {
      await action()
    } catch (error) {
      output.appendLine(`[ERROR] ${name}`)
      output.appendLine(
        error instanceof Error
          ? error.stack ?? error.message
          : String(error)
      )
    }
  }

  async function resolveUris(uris: vscode.Uri[] = []): Promise<vscode.Uri[]> {
    return uris.length > 0 ? uris : getExplorerSelection()
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'unfolder.unfoldRecursively',
      (_, uris: vscode.Uri[]) =>
        safe('Unfolds folders', () =>
          service.progress.run('Unfolding folders', async (progress, token) =>
            service.unfold(await resolveUris(uris), progress, token)
          )
        )),
    vscode.commands.registerCommand(
      'unfolder.collapseRecursively',
      (_, uris: vscode.Uri[]) =>
        safe('Collapses folders', async () =>
          service.collapse(await resolveUris(uris))
        )
    )



    // vscode.commands.registerCommand(
    //   'unfolder.unfoldRecursivelyFromKeybind',
    //   () =>
    //     safe('Unfolds folders (keybind)', () =>
    //       service.progress.run('Unfolding folders', (progress, token) =>
    //         service.unfoldWithKeybind(progress, token, output)
    //       )
    //     ))




    //TODO  resolve configuration change behavior
  )
}