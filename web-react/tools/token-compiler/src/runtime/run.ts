import type { CompilerRuntime } from '../types/run.types.ts'
import { createRuntime } from './createRuntime.ts'

export async function run(
  rootDir: string,
  tokenFolder: string | undefined,
): Promise<void> {
  let runtime: CompilerRuntime | null = null

  async function restart() {
    await runtime?.dispose()

    runtime = createRuntime(
      rootDir,
      tokenFolder,
      restart
    )
  }

  runtime = createRuntime(
    rootDir,
    tokenFolder,
    restart
  )

  if (runtime === null) {
    console.log("Disabled: Couldn't resolve paths")
    return
  }
}