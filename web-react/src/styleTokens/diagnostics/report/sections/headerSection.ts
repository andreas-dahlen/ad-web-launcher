import { colors, paint } from '../../../consoleUtils/utils.ts';
import type { ReportEntry, ReportSection } from '../../report/buildReport.ts';

export function headerSection(processedGroupCount: number): ReportSection {
  const entries: ReportEntry[] = [];

  if (processedGroupCount > 1) {
    entries.push({
      title: `\n  ✨ ${paint(`[DesignTokens]`, colors.heading)} ${paint(`Initialization complete!`, colors.value)}\n`,
      lines: [`     ${paint(`Processed Modules:`, colors.subHeading)} (${paint(processedGroupCount, colors.value)}) \n`]
    });
  } else {
    entries.push({
      title: `\n  🔄 ${paint(`[DesignTokens]`, colors.heading)} ${paint(`Update complete!`, colors.value)}\n`,
      lines: [`     ${paint(`Processed Modules:`, colors.subHeading)} (${paint(processedGroupCount, colors.value)}) \n`]
    })
  }

  return {
    title: "─────────────────────────────────────────────",
    entries
  }
}