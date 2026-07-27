import formatLogPath from '../../print/formatLogPath.ts';

import type { ReportEntry, ReportSection } from '../buildReport.ts';
import type { MissingClass } from '../../data/analyzers/analyzeTokens.ts';

export default function buildClassSection(data: MissingClass[]): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  for (const missingClass of data) {
    const lines: string[] = [];

    if (missingClass.tokenPath.length > 0) {
      lines.push(
        `File: ${formatLogPath(missingClass.tokenPath)}`);
    }

    if (missingClass.usableSelectors.length > 0) {
      lines.push(
        `Available selectors (${missingClass.usableSelectors.length})
     ${missingClass.usableSelectors.join(", ")}`
      );

      entries.push({
        title: `❌ Expected: .${missingClass.infix}`,
        lines
      });
    }
  }

  if (entries.length === 0) return;

  return {
    title: `🧩  Missing css classes for injection (${entries.length})`,
    entries
  };
}