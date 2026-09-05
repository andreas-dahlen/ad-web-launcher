import fs from 'node:fs';
import type { FormatResult } from '../../emitters/generate/generateOutput.ts';
import type { FileResult } from '../../types/compiler.types.ts';
export function patchFiles(files: FormatResult[]): FileResult {
  const updated: string[] = []
  const skipped: string[] = []

  for (const file of files) {
    if (!fs.existsSync(file.outputFile)) {
      skipped.push(file.outputFile);
      continue;
    }

    const current = fs.readFileSync(file.outputFile, "utf8");

    if (current.startsWith(file.content)) {
      skipped.push(file.outputFile);
      continue;
    }

    const update = `${file.content}\n${current}`;

    fs.writeFileSync(file.outputFile, update);
    updated.push(file.outputFile);
  }
  console.log(updated.length, skipped.length)
  return { updated, skipped }
}