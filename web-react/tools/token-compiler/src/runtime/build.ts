import { initializeCompiler } from '../compiler/compilerService.ts'
import type { UserOptions } from '../types/run.types.ts'
import { resolveConfig } from './resolveConfig.ts'

export function build(rootDir: string, options: UserOptions) {
  const config = resolveConfig(rootDir, options)

  if (config === null) {
    console.log("Disabled: Couldn't resolve paths")
    return
  }

  initializeCompiler(config)
}