import chokidar from 'chokidar'
import { whatChanged } from './resolveChange.js'
import type { TokenCompiler } from '../compiler/compilerService.js'
export function watch(rootPath: string, tokenPath: string, compiler: TokenCompiler) {

  console.log('WATCH ROOT:', rootPath)

  const watcher = chokidar.watch(rootPath, {
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