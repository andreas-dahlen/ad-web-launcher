import type { FileResult } from '../../types/compiler.types.ts';
import type { FormatResult } from '../generate/generateOutput.ts';
import fs from "node:fs";
import path from "node:path";

export function writeFiles(files: FormatResult[]): FileResult {
  const written: string[] = []
  const skipped: string[] = []

  for (const file of files) {
    fs.mkdirSync(path.dirname(file.filePath), { recursive: true })

    if (fs.existsSync(file.filePath)) {
      const current = fs.readFileSync(file.filePath, "utf8")

      if (current === file.content) {
        skipped.push(file.filePath)
        continue
      }
    }

    fs.writeFileSync(file.filePath, file.content)
    written.push(file.filePath)
  }

  return {
    updated: written,
    skipped
  }
}