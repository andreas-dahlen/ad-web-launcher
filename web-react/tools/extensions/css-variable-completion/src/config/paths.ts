import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import * as vscode from 'vscode'
import { getConfig } from './getConfig.ts'

export function resolveCascadeRoot(
  output: vscode.OutputChannel,
): string | undefined {

  const config = getConfig(output)

  if (!config) return

  const require = createRequire(import.meta.url)

  try {
    const entryPath = require.resolve('cascade', {
      paths: [config],
    })

    output.appendLine(`Cascade entry: ${entryPath}`)

    return findPackageRoot(entryPath)
  } catch (error) {
    output.appendLine(
      `Cascade resolution failed: ${error}`,
    )

    return
  }
}

export function resolveVariablesUri(
  cascadeRoot: string,
): vscode.Uri {
  return vscode.Uri.file(
    path.join(
      cascadeRoot,
      'generated/metadata/extension.jsonc',
    ),
  )
}

export function resolveLspPath(
  cascadeRoot: string,
): vscode.Uri {
  return vscode.Uri.file(
    path.join(
      cascadeRoot,
      'generated/metadata/lsp.ts',
    ),
  )
}

function findPackageRoot(
  startPath: string,
): string | undefined {
  let directory = path.dirname(startPath)

  while (true) {
    const packagePath = path.join(
      directory,
      'package.json',
    )

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
      return
    }

    directory = parent
  }
}