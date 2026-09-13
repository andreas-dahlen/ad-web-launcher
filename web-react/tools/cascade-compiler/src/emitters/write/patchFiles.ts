import fs from 'node:fs';
import type { PatchResult, FormatPatchResult, EmittedPatch } from '../../types/emitter.types.ts';


export function patchFiles(files: FormatPatchResult[]): PatchResult {
  const written: EmittedPatch[] = []
  const skipped: EmittedPatch[] = []


  for (const file of files) {
    if (!fs.existsSync(file.outputFile)) {
      skipped.push(resultOf(file))
      continue
    }

    const current = fs.readFileSync(file.outputFile, 'utf8')

    if (current.startsWith(file.content)) {
      skipped.push(resultOf(file))
      continue
    }

    const update = `${file.content}\n${current}`

    fs.writeFileSync(file.outputFile, update)
    written.push(resultOf(file))
  }

  return {
    written,
    skipped
  }
}

function resultOf(file: FormatPatchResult): EmittedPatch {
  return {
    outputFile: file.outputFile,
    kind: file.kind
  }
}

