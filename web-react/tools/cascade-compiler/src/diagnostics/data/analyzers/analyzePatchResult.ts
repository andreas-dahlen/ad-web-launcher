import type { GeneratedPatches } from '../../../types/diagnostics.types.ts'
import type { PatchResult } from '../../../types/emitter.types.ts'

export function analyzePatchResult(
  result: PatchResult | undefined
): GeneratedPatches {
  const generated: GeneratedPatches = {
    css: { written: [], skipped: [] },
    jsonc: { written: [], skipped: [] }
  }
  const written = result?.written ?? []
  const skipped = result?.skipped ?? []

  for (const file of written) {
    generated[file.kind].written.push(file.outputFile)
  }
  for (const file of skipped) {
    generated[file.kind].skipped.push(file.outputFile)
  }

  sortFiles(generated)

  return generated
}

function sortFiles(generated: GeneratedPatches) {
  for (const status of Object.values(generated)) {
    status.written.sort((a, b) => a.localeCompare(b))
    status.skipped.sort((a, b) => a.localeCompare(b))
  }
}