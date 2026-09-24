import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import * as vscode from 'vscode'

export function createSettingsResolver(
  settings: vscode.WorkspaceConfiguration,
  output: vscode.OutputChannel,
) {
  const projectRoot = getProjectRoot(settings, output)
  const cliPath = getCliSpawnPath(projectRoot)

  return {
    getCliSpawnPath(): string {
      return cliPath
    },

    getProjectRootArg(): string {
      return projectRoot
    },
  }
}

function getCliSpawnPath(projectRoot: string): string {
  const require = createRequire(import.meta.url)

  const entryPath = require.resolve('cascade', {
    paths: [projectRoot],
  })

  const packageRoot = findPackageRoot(entryPath)

  return path.join(packageRoot, 'dist', 'cli.js')
}

function findPackageRoot(startPath: string): string {
  let directory = path.dirname(startPath)

  while (true) {
    const packagePath = path.join(directory, 'package.json')

    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(
        fs.readFileSync(packagePath, 'utf8'),
      )

      if (packageJson.name === 'cascade') {
        return directory
      }
    }

    const parent = path.dirname(directory)

    if (parent === directory) {
      throw new Error('Could not find installed Cascade package.')
    }

    directory = parent
  }
}

function getProjectRoot(
  settings: vscode.WorkspaceConfiguration,
  output: vscode.OutputChannel,
): string {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]

  if (!workspaceFolder) {
    output.appendLine('ERROR: workspace folder is missing')
    throw new Error(' ')
  }

  const projectRoot = settings.get<string>('projectRoot')

  if (!projectRoot) {
    output.appendLine('ERROR: projectRoot setting is missing')
    throw new Error(' ')
  }

  return vscode.Uri.joinPath(
    workspaceFolder.uri,
    ...projectRoot.split('/'),
  ).fsPath
}

//TODO get zod?