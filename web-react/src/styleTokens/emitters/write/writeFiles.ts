import type { FileOutput } from '../format/buildOutput.ts';
import fs from "node:fs";
import path from "node:path";

export type WriteResult = {
  written: string[]
  skipped: string[]
}

export default function writeFiles(files: FileOutput[]): WriteResult {
  const written: string[] = []
  const skipped: string[] = []

  for (const file of files) {
    fs.mkdirSync(path.dirname(file.filePath), { recursive: true });

    if (fs.existsSync(file.filePath)) {
      const current = fs.readFileSync(file.filePath, "utf8");

      if (current === file.content) {
        skipped.push(file.filePath);
        continue;
      }
    }

    fs.writeFileSync(file.filePath, file.content);
    written.push(file.filePath);
  }

  return {
    written,
    skipped,
  };
}