import type { CompilerRuntime } from '../../types/run.types.ts'
import { createRuntime } from './createRuntime.ts'

export async function watch(
  projectRoot: string,
): Promise<void> {
  let runtime: CompilerRuntime | null = null

  async function restart() {
    await runtime?.dispose()

    runtime = createRuntime(
      projectRoot,
      restart
    )
  }

  runtime = createRuntime(
    projectRoot,
    restart
  )

  if (runtime === null) {
    console.log("Disabled: Couldn't resolve paths")
  }
}