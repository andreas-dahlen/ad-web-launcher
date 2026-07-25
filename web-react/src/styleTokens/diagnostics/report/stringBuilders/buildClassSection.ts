import formatLogPath from '../../formatLogPath.ts';
import type { DiagnosticSnapshot } from '../../diagnosticService.ts';
import type { ReportEntry, ReportSection } from '../buildReport.ts';

export default function buildClassSection(snapshot: DiagnosticSnapshot): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  for (const className of snapshot.missingClasses) {
    const lines: string[] = [];

    if (className.tokenPath.length > 0) {
      lines.push(
        `File: ${formatLogPath(className.tokenPath)}`);
    }

    if (className.usableSelectors) {
      lines.push(
        `Available selectors (${className.usableSelectors.length})
     ${className.usableSelectors.join(", ")}`
      );
    }


    entries.push({
      title: `❌ Expected: .${className.infix}`,
      lines
    });
  }

  if (entries.length === 0) return;

  return {
    title: `🧩  Missing css classes for injection (${snapshot.missingClasses.size})`,
    entries
  };
}