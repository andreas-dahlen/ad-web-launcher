import { initializeCompiler } from '../compiler/compilerService.ts';
import type { CssReturn } from '../types/run.types.ts';
import { resolveConfig } from './config/resolveConfig.ts';

export function css(projectRoot: string): CssReturn {

  const configData = resolveConfig(projectRoot, {
    willEmitCss: true,
    generatedPath: null,
    initialProcessing: false
  })

  const compiler = initializeCompiler(configData)

  return {
    compiler,
    tokenFolder: configData.config.tokenPath
  }
}
