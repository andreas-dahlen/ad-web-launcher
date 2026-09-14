import { compiler } from '../../cascade-compiler/src/entries/entry.ts'
import type { TokenCompiler } from '../../cascade-compiler/src/compiler/compilerService.ts'
import type { Plugin } from 'vite'
import fs from 'node:fs'
import { isTokenFile } from './helpers/isTokenFile.ts'
import { createFinalizeScheduler } from './helpers/finalizeScheduler.ts'

export function createCascadePlugin(
  projectRoot: string,
): Plugin {
  let tokenCompiler: TokenCompiler
  let tokenFolder: string | undefined

  const finalizeScheduler = createFinalizeScheduler(
    () => tokenCompiler.finalize()
  )

  return {
    name: 'cascade-plugin',
    enforce: 'pre',

    configResolved(config) {
      if (config.command === 'serve') {
        const result = compiler.runCss(projectRoot)

        tokenCompiler = result.compiler
        tokenFolder = result.tokenFolder
      } else {
        tokenCompiler = compiler.runBuild(projectRoot)
      }
    },

    transform(code, cssPath) {
      if (!cssPath.endsWith('.css')) return

      const result = tokenCompiler.handleCssChange(cssPath, code)

      if (tokenFolder) {
        finalizeScheduler.schedule()
      }
      return result
    },

    buildEnd() {
      if (!tokenFolder) {
        tokenCompiler.finalize()
      }
    },

    configureServer(server) {
      if (!tokenFolder) return

      const resolvedFolder = tokenFolder

      server.watcher.on('change', tokenPath => {
        if (!isTokenFile(resolvedFolder, tokenPath)) return

        const cssPath = tokenCompiler.handleTokenChange(tokenPath)

        if (!cssPath || !fs.existsSync(cssPath)) return

        fs.utimesSync(cssPath, new Date(), new Date())
      })
    },
  }
}