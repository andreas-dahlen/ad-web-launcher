import fs from 'node:fs'
import path from 'node:path'

export function loadCompilerConfig(projectRoot: string) {
  const configPath = path.join(
    projectRoot,
    'compiler.config.json',
  )

  if (!fs.existsSync(configPath)) {
    return {}
  }

  return JSON.parse(
    fs.readFileSync(configPath, 'utf8'),
  )
}