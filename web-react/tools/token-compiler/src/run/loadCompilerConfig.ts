import fs from 'node:fs'
import path from 'node:path'
import type { CompilerOptions } from '../types/run.types.js'
import { compilerConfigSchema } from '../configSchema.js'

export function loadCompilerConfig(projectRoot: string): CompilerOptions {
  const configPath = path.join(
    projectRoot,
    'compiler.config.json',
  )

  if (!fs.existsSync(configPath)) {
    return {}
  }

  const raw = JSON.parse(
    fs.readFileSync(configPath, 'utf8'),
  )

  return compilerConfigSchema.parse(raw)
}