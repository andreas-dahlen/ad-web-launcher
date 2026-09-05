import { colors, formatLogPath, paint } from '../../../../utils/string.ts';
import type { FileStatus } from '../../../../types/diagnostics.types.ts';
import type { ReportEntry, ReportSection } from '../../buildReport.ts';

export function presetSection(data: FileStatus): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  const skippedLines: string[] = [];
  if (data.skipped.length > 0) {
    for (const skipped of data.skipped) {

      skippedLines.push(
        `${paint('File', colors.muted)}: ${paint(formatLogPath(skipped), colors.file)}`);
    }
    entries.push({
      title: ` 😴 ${paint(`skipped:`, colors.subHeading)}`,
      lines: skippedLines
    });
  }
  const writtenLines: string[] = [];
  if (data.written.length > 0) {
    for (const written of data.written) {

      writtenLines.push(
        `${paint('File', colors.muted)}: ${paint(formatLogPath(written), colors.file)}`);
    }

    entries.push({
      title: ` ✅ ${paint(`written:`, colors.success)}`,
      lines: writtenLines
    });
  }

  if (entries.length === 0) return;

  return {
    title: ` 📁 ${paint(`[Preset files]`, colors.heading)} (${paint(data.skipped.length + data.written.length, colors.value)}) \n`,
    entries
  };
}