import * as vscode from 'vscode'

export function progressHandler() {
  async function run(
    title: string,
    task: (
      progress: vscode.Progress<{ message?: string; increment?: number }>,
      token: vscode.CancellationToken
    ) => Promise<void>
  ): Promise<void> {
    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title,
        cancellable: true,
      },
      (progress, token) => task(progress, token)
    )
  }

  return { run }
}