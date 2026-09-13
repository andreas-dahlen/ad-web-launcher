import chokidar, { FSWatcher } from 'chokidar'
import { whatChanged } from './resolveChange.ts'
import type { TokenCompiler } from '../../../compiler/compilerService.ts'
export function watchContent({
  projectRoot,
  tokenPath }
  : {
    projectRoot: string,
    tokenPath: string
  },
  compiler: TokenCompiler): FSWatcher {

  const watcher = chokidar.watch(projectRoot, {
    ignoreInitial: true,
  })

  watcher.on('change', filePath => {
    const change = whatChanged(filePath, tokenPath)

    switch (change) {
      case 'CSS':
        compiler.handleCssChange(filePath)
        compiler.finalize()
        break
      case 'TOKEN':
        compiler.handleTokenChange(filePath)
        compiler.finalize()
        break
    }
  })

  return watcher
}