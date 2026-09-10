import type { EmittedFile, FileResult, FormatFileResult } from '../../types/emitter.types.ts';
import fs from "node:fs";
import path from "node:path";
export function writeFiles(files: FormatFileResult[]): FileResult {
  const written: EmittedFile[] = []
  const skipped: EmittedFile[] = []



  for (const file of files) {
    fs.mkdirSync(path.dirname(file.outputFile), { recursive: true })

    if (fs.existsSync(file.outputFile)) {
      const current = fs.readFileSync(file.outputFile, "utf8")

      if (current === file.content) {
        skipped.push(resultOf(file))
        continue
      }
    }

    fs.writeFileSync(file.outputFile, file.content)
    written.push(resultOf(file))
  }

  return {
    written,
    skipped
  }
}

function resultOf(file: FormatFileResult): EmittedFile {
  return {
    outputFile: file.outputFile,
    kind: file.kind
  }
}