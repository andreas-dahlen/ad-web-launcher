import chokidar from 'chokidar'
import { whatChanged } from './resolveChange.js'
import type { TokenCompiler } from '../compiler/compilerService.js'
export function watch({
  rootDir,
  tokenPath }
  : {
    rootDir: string,
    tokenPath: string
  },
  compiler: TokenCompiler) {

  console.log('WATCH ROOT:', rootDir)

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
}