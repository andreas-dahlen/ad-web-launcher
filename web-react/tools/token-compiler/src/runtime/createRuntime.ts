import { initializeCompiler } from '../compiler/compilerService.js'
import type { CompilerRuntime, UserOptions } from '../types/run.types.js'
import { resolveConfig } from './resolveConfig.js'
import { watchConfig } from './watchers/watchConfig.js'
import { watchContent } from './watchers/watchContent.js'

export function createRuntime(
  rootDir: string,
  options: UserOptions,
  onConfigChange: () => Promise<void>,
): CompilerRuntime | null {
  const config = resolveConfig(rootDir, options)

  if (config === null) {
    return null
  }

  const compiler = initializeCompiler(config)

  const contentWatcher = watchContent(config, compiler)

  const configWatcher = watchConfig(config.rootDir, onConfigChange)

  async function dispose() {
    await contentWatcher.close()
    await configWatcher.close()
  }

  return {
    compiler,
    contentWatcher,
    configWatcher,
    dispose
  }
}