import * as vscode from 'vscode'
import { createSliceProvider } from './core/createSliceProvider.ts'
import { register } from './vscode/register.ts'
import { loadHandler } from './loaders/loadHandler.ts'
import { createSliceMapCache } from './processing/sliceMapCache.ts'

export function activate(context: vscode.ExtensionContext): void {
  const output = vscode.window.createOutputChannel('Slice Maps')

  context.subscriptions.push(output)

  output.appendLine('[slice maps] loaded')

  const data = loadHandler(context)

  if (!data) return

  const cache = createSliceMapCache(context, data)

  const maps = createSliceProvider(cache, output)

  if (!maps) return

  register(context, maps, output)
}

export function deactivate(): void { }