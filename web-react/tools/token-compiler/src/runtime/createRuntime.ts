import { initializeCompiler } from '../compiler/compilerService.ts'
import type { CompilerRuntime } from '../types/run.types.ts'
import { resolveConfig } from './resolveConfig.ts'
import { watchConfig } from './watchers/watchConfig.ts'
import { watchContent } from './watchers/watchContent.ts'

export function createRuntime(
  rootDir: string,
  tokenFolder: string | undefined,
  onConfigChange: () => Promise<void>,
): CompilerRuntime | null {
  const config = resolveConfig(rootDir, tokenFolder)

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