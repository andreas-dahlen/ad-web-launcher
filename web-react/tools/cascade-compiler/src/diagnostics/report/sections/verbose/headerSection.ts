import { colors, paint } from '../../../../utils/string.ts';
import type { ReportEntry, ReportSection } from '../../buildReport.ts';

export function headerSection(processedGroupCount: number): ReportSection {
  const title: string = "─────────────────────────────────────────────"

  if (processedGroupCount > 1) {
    return {
      title,
      entries: [{
        title: `\n  ✨ ${paint(`[CascadeTokens]`, colors.heading)} ${paint(`Initialization complete!`, colors.value)}\n`,
        lines: [`     ${paint(`Processed Modules:`, colors.subHeading)} (${paint(processedGroupCount, colors.value)}) \n`]
      }] satisfies ReportEntry[]
    }
  }

  return {
    title,
    entries: [{
      title: `\n  🔄 ${paint(`[CascadeTokens]`, colors.heading)} ${paint(`Update complete!`, colors.value)}\n`,
      lines: [`     ${paint(`Processed Modules:`, colors.subHeading)} (${paint(processedGroupCount, colors.value)}) \n`]
    }] satisfies ReportEntry[]
  }
}