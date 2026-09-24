import type { Plugin } from 'vite'
import fs from 'node:fs'
import { isTokenFile } from './helpers/isTokenFile.ts'
import { createFinalizeScheduler } from './helpers/finalizeScheduler.ts'
import { compiler } from '../entries/entry.ts'
import type { TokenCompiler } from '../compiler/compilerService.ts'

export function createCascadePlugin(
  startDirectory: string,
): Plugin {
  let tokenCompiler: TokenCompiler
  let tokenFolder: string | undefined
  let isServe = false

  const finalizeScheduler = createFinalizeScheduler(
    () => tokenCompiler.finalize()
  )

  return {
    name: 'cascade-plugin',
    enforce: 'pre',

    configResolved(config) {
      isServe = config.command === 'serve'

      const result = compiler.runCss(startDirectory)

      tokenCompiler = result.compiler
      tokenFolder = result.tokenFolder
    },

    transform(code, cssPath) {
      if (!cssPath.endsWith('.css')) return

      const result = tokenCompiler.handleCssChange(cssPath, code)

      if (isServe) {
        finalizeScheduler.schedule()
      }

      return result
    },

    configureServer(server) {
      if (!isServe) return

      const resolvedFolder = tokenFolder

      server.watcher.on('change', tokenPath => {
        if (!resolvedFolder || !isTokenFile(resolvedFolder, tokenPath)) return

        const cssPath = tokenCompiler.handleTokenChange(tokenPath)

        if (!cssPath || !fs.existsSync(cssPath)) return

        fs.utimesSync(cssPath, new Date(), new Date())
      })
    },
  }
}