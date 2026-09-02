import type { FileResult } from '../../types/compiler.types.ts';
import type { FormatResult } from '../generate/generateOutput.ts';
import fs from "node:fs";
import path from "node:path";

export function writeFiles(files: FormatResult[]): FileResult {
  const written: string[] = []
  const skipped: string[] = []

  for (const file of files) {
    fs.mkdirSync(path.dirname(file.outputFile), { recursive: true })

    if (fs.existsSync(file.outputFile)) {
      const current = fs.readFileSync(file.outputFile, "utf8")

      if (current === file.content) {
        skipped.push(file.outputFile)
        continue
      }
    }

    fs.writeFileSync(file.outputFile, file.content)
    written.push(file.outputFile)
  }

  return {
    updated: written,
    skipped
  }
}