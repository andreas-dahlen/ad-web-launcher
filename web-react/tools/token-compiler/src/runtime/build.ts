import { initializeCompiler } from '../compiler/compilerService.ts'
import { resolveConfig } from './resolveConfig.ts'

export function build(rootDir: string, tokenFolder: string | undefined) {
  const config = resolveConfig(rootDir, tokenFolder)

  if (config === null) {
    console.log("Disabled: Couldn't resolve paths")
    return
  }

  initializeCompiler(config)
}