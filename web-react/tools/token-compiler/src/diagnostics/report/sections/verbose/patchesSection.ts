import type { GeneratedPatches } from '../../../../types/diagnostics.types.ts';
import type { CompilerOutputs } from '../../../../types/run.types.ts';
import { colors, emitValueMsg, formatLogPath, paint } from '../../../../utils/string.ts';
import type { ReportEntry, ReportSection } from '../../buildReport.ts';



export function patchesSection(
  data: GeneratedPatches,
  outputs: CompilerOutputs
): ReportSection {
  const files = Object.values(data)
    .flatMap(({ written, skipped }) => [...written, ...skipped])

  const entries: ReportEntry[] = []

  for (const { written, skipped } of Object.values(data)) {
    for (const file of written) {
      entries.push({
        title: `${paint('File', colors.muted)}: ${paint(
          formatLogPath(file),
          colors.file
        )} (✔️)`
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
  }

  if (entries.length === 0) {
    if (outputs.pathPatches === true) {
      throw new Error(
        `Output "pathPatches" was enabled but produced no patched file.`
      )
    }
    return {
      title: `🩹 ${paint(`[File patches]`, colors.heading)} (☠️ ) \n`,
      entries: []
    }
  }


  return {
    title: ` 🩹 ${paint(`[File patches]`, colors.heading)} (${paint(
      emitValueMsg(files, true),
      colors.value,
    )})\n`,
    entries
  }
}