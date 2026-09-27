import * as vscode from 'vscode'
export async function createSliceMaps(output: vscode.OutputChannel) {

  // const exclude = config.get<Record<string, boolean>>('exclude', {})

  // output.appendLine(JSON.stringify(exclude, null, 2))

  // const ignoreList = [
  //   "**/.git",
  //   "**/.svn",
  //   "**/.hg",
  //   "**/.jj",
  //   "**/.DS_Store",
  //   "**/Thumbs.db"]

  // const inspect = config.inspect<Record<string, boolean>>('exclude')
  const config = vscode.workspace.getConfiguration(
    'files',
    vscode.workspace.workspaceFolders?.[0].uri,
  )

  // const folder = vscode.workspace.workspaceFolders?.[0]


  const inspect = config.inspect<Record<string, boolean>>('exclude')

  const folderExclude = inspect?.workspaceFolderValue ?? {}

  await config.update(
    'exclude',
    {
      ...folderExclude,
      'README.md': true,
    },
    vscode.ConfigurationTarget.WorkspaceFolder,
  )

  output.appendLine(JSON.stringify(inspect, null, 2))


  output.appendLine('[slice maps] README.md excluded')
}

// type Slice = {
//   name: string
//   patterns: string[]
// }

// type PathNode = {
//   path: string
//   type: 'file' | 'directory'
//   children?: PathNode[]
// }

// function resolveManagedPatterns(
//   slice: Slice,
//   tree: PathNode,
// ): string[] {
//   // ¯\_(ツ)_/¯


// }