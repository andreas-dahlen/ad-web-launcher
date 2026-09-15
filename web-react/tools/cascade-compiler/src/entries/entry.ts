import type { TokenCompiler } from '../compiler/compilerService.ts'
import { build } from './build.ts'
import { css } from './css.ts'
import { watch } from './watch/watch.ts'
import type { CssReturn } from '../types/run.types.ts'
import { findProjectRoot } from './config/findProjectRoot.ts'

export const compiler = {
  runCss(startDirectory: string): CssReturn {
    return css(findProjectRoot(startDirectory))
  },
  runBuild(startDirectory: string): TokenCompiler {
    return build(findProjectRoot(startDirectory))
  },
  runWatch(startDirectory: string): void {
    watch(findProjectRoot(startDirectory))
  }
}