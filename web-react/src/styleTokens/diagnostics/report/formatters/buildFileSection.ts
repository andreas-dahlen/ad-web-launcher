import type { ReportEntry, ReportSection } from '../buildReport.ts';

export default function buildFileSection(data: string[]): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  for (const missingFile of data) {
    const lines: string[] = [];

    if (missingFile) {
      // lines.push();


      entries.push({
        title: ` ❌ ${missingFile}.module.css`,
        lines
      });
    }
  }
  if (entries.length === 0) return;

  return {
    title: `📁 [Missing Files] (${entries.length}) \n`,
    entries
  };
}