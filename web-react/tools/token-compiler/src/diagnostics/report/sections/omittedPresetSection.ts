import { colors, formatLogPath, paint } from '../../../utils/string.js';
import type { ReportEntry, ReportSection } from '../buildReport.js';

export function omittedPresetSection(data: string[]): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  const skippedLines: string[] = [];
  if (data.length > 0) {
    for (const cssPath of data) {

      skippedLines.push(
        `${paint('File', colors.muted)}: ${paint(formatLogPath(cssPath), colors.file)}`);
    }
    entries.push({
      title: ` ❗ ${paint(`omitted:`, colors.subHeading)}`,
      lines: skippedLines
    });
  }

  if (entries.length === 0) return;

  return {
    title: ` 🥴 ${paint(`[Omitted Preset Files]`, colors.heading)} (${paint(data.length, colors.value)}) \n`,
    entries
  };
}