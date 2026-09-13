import { initializeCompiler } from '../../compiler/compilerService.ts'
import type { CompilerRuntime } from '../../types/run.types.ts'
import { resolveConfig } from '../config/resolveConfig.ts'
import { watchConfig } from './watchers/watchConfig.ts'
import { watchContent } from './watchers/watchContent.ts'

export function createRuntime(
  projectRoot: string,
  tokenFolder: string | undefined,
  onConfigChange: () => Promise<void>,
): CompilerRuntime | null {
  const config = resolveConfig(projectRoot, tokenFolder)

  if (config === null) {
    return null
  }

  const compiler = initializeCompiler(config)

  const contentWatcher = watchContent(config, compiler)

  const configWatcher = watchConfig(config.projectRoot, onConfigChange)

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