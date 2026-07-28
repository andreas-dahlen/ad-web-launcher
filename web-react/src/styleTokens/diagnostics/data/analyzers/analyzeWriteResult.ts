import formatLogPath from '../../print/formatLogPath.ts'
import type { WriteResult } from '../../../emitters/write/writeFiles.ts'


export type GeneratedFiles = {
  presets: FileStatus
  tokens: FileStatus
}

export type FileStatus = {
  written: string[]
  skipped: string[]
}

export default function analyzeWriteResult(result: WriteResult | undefined): GeneratedFiles {

  const generatedFiles: GeneratedFiles = {
    presets: {
      written: [],
      skipped: []
    },
    tokens: {
      written: [],
      skipped: []
    }
  }

  const writtenPaths = result?.written ?? []
  const skippedPaths = result?.skipped ?? []

  const writtenFiles = writtenPaths.map(formatLogPath)
  const skippedFiles = skippedPaths.map(formatLogPath)

  for (const file of writtenFiles) {
    if (file.endsWith(".preset.ts")) {
      generatedFiles.presets.written.push(file)
    }
    if (file.endsWith(".token.ts")) {
      generatedFiles.tokens.written.push(file)
    }
  }

  for (const file of skippedFiles) {
    if (file.endsWith(".preset.ts")) {
      generatedFiles.presets.skipped.push(file)
    }
    if (file.endsWith(".token.ts")) {
      generatedFiles.tokens.skipped.push(file)
    }
  }


  sortFiles(generatedFiles.presets.written)
  sortFiles(generatedFiles.presets.skipped)
  sortFiles(generatedFiles.tokens.written)
  sortFiles(generatedFiles.tokens.skipped)

  return generatedFiles
}

function sortFiles(files: string[]) {
  files.sort((a, b) => a.localeCompare(b))
}
