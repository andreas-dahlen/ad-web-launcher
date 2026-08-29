import chokidar, { FSWatcher } from 'chokidar'
import { whatChanged } from '../resolveChange.js'
import type { TokenCompiler } from '../../compiler/compilerService.js'
export function watchContent({
  rootDir,
  tokenPath }
  : {
    rootDir: string,
    tokenPath: string
  },
  compiler: TokenCompiler): FSWatcher {

  const watcher = chokidar.watch(rootDir, {
    ignoreInitial: true,
  })

  watcher.on('change', filePath => {
    const change = whatChanged(filePath, tokenPath)

    switch (change) {
      case 'CSS':
        compiler.handleCssChange(filePath)
        break
      case 'TOKEN':
        compiler.handleTokenChange(filePath)
        break
    }
  })

  return watcher
}