import type { ReportEntry, ReportSection } from '../buildReport.ts';
import type { FileStatus } from '../../data/analyzers/analyzeWriteResult.ts';

export default function buildPresetSection(data: FileStatus): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  const skippedLines: string[] = [];
  if (data.skipped.length > 0) {
    for (const skipped of data.skipped) {

      skippedLines.push(
        `File: ${skipped}`);
    }
    entries.push({
      title: ` 😴 skipped:`,
      lines: skippedLines
    });
  }
  const writtenLines: string[] = [];
  if (data.written.length > 0) {
    for (const written of data.written) {

      writtenLines.push(
        `File: ${written}`);
    }

    entries.push({
      title: ` ✅ written:`,
      lines: writtenLines
    });
  }

  if (entries.length === 0) return;

  return {
    title: ` 📁 [Preset files] (${data.skipped.length + data.written.length}) \n`,
    entries
  };
}