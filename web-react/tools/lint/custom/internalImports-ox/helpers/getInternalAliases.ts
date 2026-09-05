import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'jsonc-parser'

export function getInternalAliases(cwd: string): string[] {
  const configPath = path.join(cwd, 'tsconfig.paths.json')

  if (!fs.existsSync(configPath)) {
    return []
  }

  const source = fs.readFileSync(configPath, 'utf8')
  const config = parse(source)

  const paths = config?.compilerOptions?.paths

  if (!paths || typeof paths !== 'object') {
    return []
  }

  return Object.keys(paths).map(alias =>
    alias.endsWith('/*')
      ? alias.slice(0, -1)
      : alias
  )
}