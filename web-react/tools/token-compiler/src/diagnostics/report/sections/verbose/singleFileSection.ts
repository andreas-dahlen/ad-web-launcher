import type { GeneratedFiles } from '../../../../types/diagnostics.types.ts'
import type { CompilerOutputs } from '../../../../types/run.types.ts'
import {
  colors,
  emitValueMsg,
  formatLogPath,
  paint,
} from '../../../../utils/string.ts'
import type { ReportEntry, ReportSection } from '../../buildReport.ts'

export function singleFileSection(
  generatedFiles: GeneratedFiles,
  outputs: CompilerOutputs,
): ReportSection {
  const { presets, tokens, ...generated } = generatedFiles
  const { pathPatches, presets: _, tokens: __, ...relevant } = outputs

  const files = Object.values(generated)
    .flatMap(({ written, skipped }) => [...written, ...skipped])

  const entries: ReportEntry[] = []

  for (const [key, { written, skipped }] of Object.entries(generated)) {
    for (const file of written) {
      entries.push({
        title: `${paint('File', colors.muted)}: ${paint(
          formatLogPath(file),
          colors.file,
        )} (✔️)`,
      })
    }

    for (const file of skipped) {
      entries.push({
        title: `${paint('File', colors.muted)}: ${paint(
          formatLogPath(file),
          colors.file
        )} (⏩)`
      })
    }

    if (
      written.length === 0 &&
      skipped.length === 0 &&
      relevant[key as keyof typeof relevant] === true
    ) {
      throw new Error(
        `Output "${key}" was enabled but produced no generated file.`
      )
    }
  }

  for (const [key, enabled] of Object.entries(relevant)) {
    if (!enabled) {
      entries.push({
        title: `${paint('File', colors.muted)}: ${paint(
          key,
          colors.file,
        )}: Disabled (☠️ )`
      })
    }
  }

  return {
    title: ` 📄 ${paint('[Single files]', colors.heading)} (${paint(
      emitValueMsg(files, true),
      colors.value,
    )})\n`,
    entries
  }
}