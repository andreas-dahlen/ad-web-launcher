import formatLogPath from '../../print/formatLogPath.ts';

import type { ReportEntry, ReportSection } from '../buildReport.ts';
import type { UnusableSelector } from '../../data/analyzers/analyzeSelectors.ts';

export default function buildSelectorSection(data: UnusableSelector[]): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  for (const unusables of data) {
    const lines: string[] = [];


    if (unusables.unusableSelectors.length > 0) {
      lines.push(
        `Selectors (${unusables.unusableSelectors.length})
     ${unusables.unusableSelectors.join(", ")}`
      );



      entries.push({
        title: `🚮 File: ${formatLogPath(unusables.cssPath)}`,
        lines
      });
    }
  }
  if (entries.length === 0) return;

  return {
    title: `🙊 Unusable preset selectors (${entries.length})`,
    entries
  };
}