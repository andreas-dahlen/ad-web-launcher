import { initializeCompiler, type TokenCompiler } from '../compiler/compilerService.ts'
import { resolveConfig } from './config/resolveConfig.ts'

export function build(projectRoot: string): TokenCompiler {

  const config = resolveConfig(projectRoot, {
    willEmitCss: true,
    initialProcessing: false
  })

  return initializeCompiler(config)
}