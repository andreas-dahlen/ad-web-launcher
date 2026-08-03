import { colors, paint } from '../../../consoleUtils/utils.ts';
import type { ReportEntry, ReportSection } from '../buildReport.ts';
export function fileSection(data: string[]): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  for (const missingFile of data) {
    const lines: string[] = [];

    if (missingFile) {

      entries.push({
        title: `    ${paint("File:", colors.muted)} ${paint(`${missingFile}.module.css`, colors.file)}`,
        lines
      });
    }
  }
  if (entries.length === 0) return;

  return {
    title: `${paint("📁 [Missing Files]", colors.heading)} (${paint(entries.length, colors.value)}) \n
  ${paint(` ❌ Expected:`, colors.error)}`,
    entries
  };
}