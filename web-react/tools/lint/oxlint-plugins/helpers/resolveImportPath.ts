import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'jsonc-parser'

type PathsConfig = Record<string, string[]>

export function resolveImportPath(
  source: string,
  importerPath: string,
  projectRoot: string
): string | undefined {
  if (source.startsWith('.')) {
    return path.resolve(
      path.dirname(importerPath),
      source
    )
  }

  const configPath = path.join(projectRoot, 'tsconfig.paths.json')

  if (!fs.existsSync(configPath)) {
    return undefined
  }

  const sourceText = fs.readFileSync(configPath, 'utf8')
  const config = parse(sourceText)

  const paths = config?.compilerOptions?.paths as
    | PathsConfig
    | undefined

  if (!paths) {
    return undefined
  }

  for (const [alias, targets] of Object.entries(paths)) {
    const aliasPrefix = alias.endsWith('/*')
      ? alias.slice(0, -1)
      : alias

    if (!source.startsWith(aliasPrefix)) {
      continue
    }

    const target = targets[0]

    if (!target) {
      continue
    }

    const targetPrefix = target.endsWith('/*')
      ? target.slice(0, -1)
      : target

    const remainder = source.slice(aliasPrefix.length)

    return path.resolve(
      projectRoot,
      targetPrefix + remainder
    )
  }

  return undefined
}