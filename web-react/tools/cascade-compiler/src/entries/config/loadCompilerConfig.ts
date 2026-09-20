import fs from 'node:fs'
import path from 'node:path'
import {
  parse,
  printParseErrorCode,
  type ParseError,
} from 'jsonc-parser'

import type { CompilerOptionsAndIssues } from '../../types/run.types.ts'
import { compilerConfigSchema } from '../../schema/configSchema.ts'
import { asObject } from '../../utils/asObject.ts'
import { resolveConfigRecovery } from './resolveConfigRecovery.ts'

export function loadCompilerConfig(projectRoot: string): CompilerOptionsAndIssues {
  const configPath = path.join(
    projectRoot,
    'cascade.config.json',
  )

  if (!fs.existsSync(configPath)) {
    throw new Error(
      `couldn't find a cascade.config.json file`
    )
  }

  const text = fs.readFileSync(configPath, 'utf8')

  const errors: ParseError[] = []
  const raw = parse(text, errors)

  if (errors.length > 0) {
    const details = errors
      .map(error => printParseErrorCode(error.error))
      .join(', ')

    throw new Error(
      `Invalid JSONC in ${configPath}: ${details}`,
    )
  }

  const config = asObject(raw)
  if (!config) {
    throw new Error('Cascade configuration must be a JSON object')
  }

  const zodResult = compilerConfigSchema.safeParse(raw)

  if (zodResult.success) {
    return {
      config: zodResult.data,
      issues: []
    }
  }

  return resolveConfigRecovery(config)
}