import { initializeCompiler } from '../compiler/compilerService.ts';
import type { CssReturn } from '../types/run.types.ts';
import { resolveConfig } from './config/resolveConfig.ts';

export function css(projectRoot: string): CssReturn {

  const config = resolveConfig(projectRoot, {
    willEmitCss: true,
    outPath: null,
    initialProcessing: false
  })

  const compiler = initializeCompiler(config)

  return {
    compiler,
    tokenFolder: config.tokenPath
  }
}
