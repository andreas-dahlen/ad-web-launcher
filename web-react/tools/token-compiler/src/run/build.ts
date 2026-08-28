import { initializeCompiler } from '../compiler/compilerService.js'
import type { UserOptions } from '../types/run.types.js'
import { resolveConfig } from './resolveConfig.js'

export function build(rootDir: string, options: UserOptions) {
  const config = resolveConfig(rootDir, options)

  if (config === null) {
    console.log("Disabled: Couldn't resolve paths")
    return
  }

  initializeCompiler(config)
}