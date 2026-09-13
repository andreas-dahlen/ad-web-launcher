import { colors, formatLogPath, paint } from '../../../../utils/string.ts';
import type { MissingClass } from '../../../../types/diagnostics.types.ts';
import type { ReportEntry, ReportSection } from '../../buildReport.ts';

export function classSection(data: MissingClass[]): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  for (const missingClass of data) {
    const lines: string[] = [];

    if (missingClass.tokenPath.length > 0) {
      lines.push(
        `${paint("File:", colors.muted)} ${paint(formatLogPath(missingClass.tokenPath), colors.file)}`
      );
    }

    if (missingClass.usableSelectors.length > 0) {
      lines.push(
        `${paint(
          "Available selectors", colors.subHeading)} (${paint(missingClass.usableSelectors.length, colors.value)}),
     ${colors.symbol}${missingClass.usableSelectors.join(`${colors.reset}, ${colors.symbol}`)}${colors.reset}`
      );

      entries.push({
        title: ` ${paint("❌ Expected:", colors.error)} .${paint(missingClass.infix, colors.symbol)}`,
        lines
      });
    }
  }

  if (entries.length === 0) return;

  return {
    title: `${paint("🎯 [Missing Css Classes]", colors.heading)} (${paint(entries.length, colors.value)}) \n`,
    entries
  };
}