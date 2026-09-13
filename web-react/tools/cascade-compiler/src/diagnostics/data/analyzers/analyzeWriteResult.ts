
import type { GeneratedFiles } from '../../../types/diagnostics.types.ts'
import type { FileResult } from '../../../types/emitter.types.ts'

export function analyzeWriteResult(
  result: FileResult | undefined
): GeneratedFiles {
  const generatedFiles: GeneratedFiles = {
    presets: { written: [], skipped: [] },
    tokens: { written: [], skipped: [] },
    meta: { written: [], skipped: [] },
    lsp: { written: [], skipped: [] },
    extension: { written: [], skipped: [] },
    schema: { written: [], skipped: [] }
  }

  const written = result?.written ?? []
  const skipped = result?.skipped ?? []

  for (const file of written) {
    generatedFiles[file.kind].written.push(file.outputFile)
  }

  for (const file of skipped) {
    generatedFiles[file.kind].skipped.push(file.outputFile)
  }

  sortFiles(generatedFiles)

  return generatedFiles
}

function sortFiles(generated: GeneratedFiles) {
  for (const status of Object.values(generated)) {
    status.written.sort((a, b) => a.localeCompare(b))
    status.skipped.sort((a, b) => a.localeCompare(b))
  }
}