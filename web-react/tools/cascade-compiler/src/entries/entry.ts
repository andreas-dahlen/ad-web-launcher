import type { TokenCompiler } from '../compiler/compilerService.ts'
import { build } from './build.ts'
import { css } from './css.ts'
import { watch } from './watch/watch.ts'
import type { CssReturn } from '../types/run.types.ts'

export const compiler = {
  runCss(projectRoot: string): CssReturn {
    return css(projectRoot)
  },
  runBuild(projectRoot: string): TokenCompiler {
    return build(projectRoot)
  },
  runWatch(projectRoot: string, tokenFolder: string): void {
    watch(projectRoot, tokenFolder)
  }
}