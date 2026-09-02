import type { CompilerRuntime, UserOptions } from '../types/run.types.ts'
import { createRuntime } from './createRuntime.ts'

export async function run(
  rootDir: string,
  options: UserOptions,
): Promise<void> {
  let runtime: CompilerRuntime | null = null

  async function restart() {
    await runtime?.dispose()

    runtime = createRuntime(
      rootDir,
      options,
      restart
    )
  }

  runtime = createRuntime(
    rootDir,
    options,
    restart
  )

  if (runtime === null) {
    console.log("Disabled: Couldn't resolve paths")
    return
  }
}