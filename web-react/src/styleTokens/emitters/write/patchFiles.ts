import fs from 'node:fs';
import type { FormatResult } from '../../emitters/generate/generateOutput.ts';
import type { FileResult } from '../../types/compiler.types.ts';
export function patchFiles(files: FormatResult[]): FileResult {
  const updated: string[] = []
  const skipped: string[] = []

  for (const file of files) {
    if (!fs.existsSync(file.filePath)) {
      skipped.push(file.filePath);
      continue;
    }

    const current = fs.readFileSync(file.filePath, "utf8");

    if (current.startsWith(file.content)) {
      skipped.push(file.filePath);
      continue;
    }

    const update = `${file.content}\n${current}`;

    fs.writeFileSync(file.filePath, update);
    updated.push(file.filePath);
  }
  return { updated, skipped }
}