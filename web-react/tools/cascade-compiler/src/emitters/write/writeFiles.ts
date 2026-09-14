import type { EmittedFile, FileResult, FormatFileResult } from '../../types/emitter.types.ts';
import fs from "node:fs";
import path from "node:path";
export function writeFiles(files: FormatFileResult[], outPath: string): FileResult {
  const written: EmittedFile[] = []
  const skipped: EmittedFile[] = []



  for (const file of files) {
    const outputFile = path.join(outPath, file.outputFile)


    fs.mkdirSync(path.dirname(outputFile), { recursive: true })

    if (fs.existsSync(outputFile)) {
      const current = fs.readFileSync(outputFile, "utf8")

      if (current === file.content) {
        skipped.push(resultOf(file))
        continue
      }
    }

    fs.writeFileSync(outputFile, file.content)
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