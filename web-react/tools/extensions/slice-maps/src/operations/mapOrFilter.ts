import * as vscode from 'vscode'

type SliceType = 'map' | 'filter'

export async function requestMapOrFilter(): Promise<SliceType | undefined> {
  const options = [
    { label: '$(layers) Map', description: 'Create a new Slice Map', value: 'map' },
    { label: '$(filter) Filter', description: 'Create a new Slice Filter', value: 'filter' },
  ] satisfies vscode.QuickPickItem[] & { value: SliceType }[]

  const selected = await vscode.window.showQuickPick(options, {
    placeHolder: 'Create a Map or Filter'
  })

  return selected?.value
}
