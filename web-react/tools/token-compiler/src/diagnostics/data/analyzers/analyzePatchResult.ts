import type { FileResult } from '../../../types/compiler.types.ts';
import type { GeneratedPatches } from '../../../types/diagnostics.types.ts';



export function analyzePatchResult(result: FileResult | undefined): GeneratedPatches {

  const generatedPatches: GeneratedPatches = {
    css: {
      written: [],
      skipped: []
    },
    jsonc: {
      written: [],
      skipped: []
    },
  }

  const writtenPatchs = result?.updated ?? []
  const skippedPatchs = result?.skipped ?? []

  for (const file of writtenPatchs) {
    if (file.endsWith("module.css")) {
      generatedPatches.css.written.push(file)
    } else if (file.endsWith(".jsonc")) {
      generatedPatches.jsonc.written.push(file)
    }
  }

  for (const file of skippedPatchs) {
    if (file.endsWith("module.css")) {
      generatedPatches.css.skipped.push(file)
    } else if (file.endsWith(".jsonc")) {
      generatedPatches.jsonc.skipped.push(file)
    }
  }

  sortFiles(generatedPatches.css.written)
  sortFiles(generatedPatches.css.skipped)
  sortFiles(generatedPatches.jsonc.written)
  sortFiles(generatedPatches.jsonc.skipped)


  return generatedPatches

}

function sortFiles(files: string[]) {
  files.sort((a, b) => a.localeCompare(b))
}