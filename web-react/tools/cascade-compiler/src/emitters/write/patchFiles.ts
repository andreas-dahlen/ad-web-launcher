import fs from 'node:fs';
import type { PatchResult, FormatPatchResult, EmittedPatch } from '../../types/emitter.types.ts';
import path from 'node:path';


export function patchFiles(files: FormatPatchResult[], outPath: string): PatchResult {
  const written: EmittedPatch[] = []
  const skipped: EmittedPatch[] = []


  for (const file of files) {
    const outputFile = path.join(outPath, file.outputFile)

    if (!fs.existsSync(outputFile)) {
      skipped.push(resultOf(file))
      continue
    }

    const current = fs.readFileSync(outputFile, 'utf8')

    if (current.startsWith(file.content)) {
      skipped.push(resultOf(file))
      continue
    }

    const update = `${file.content}\n${current}`

    fs.writeFileSync(outputFile, update)
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

