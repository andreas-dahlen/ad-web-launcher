
import { colors, paint } from '../../../consoleUtils/utils.ts';
import type { VariableMismatch } from '../../../types/diagnostics.types.ts';
import type { ReportEntry, ReportSection } from '../buildReport.ts';

export function variableSection(data: VariableMismatch[]): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  for (const variable of data) {
    const lines: string[] = [];

    if (variable.unused.length > 0) {
      lines.push(
        ` ${paint(`🎨 Unused in:`, colors.error)} ${paint(`CSS`, colors.file)} (${paint(variable.unused.length, colors.value)})`,
        ...variable.unused.map(variable => `    ${paint(variable, colors.symbol)}`)
      );
    }

    if (variable.missing.length > 0) {
      lines.push(
        ` ${paint(`📦 Missing in:`, colors.error)} ${paint(`JSON`, colors.file)} (${paint(variable.missing.length, colors.value)})`,
        ...variable.missing.map(variable => `    ${paint(variable, colors.variable)}`)
      );
    }

    const component =
      variable.name == variable.infix
        ? variable.name
        : `${variable.name}-${variable.infix}`

    entries.push({
      title: ` 🧩 ${paint(`Component: `, colors.subHeading)}${paint(component, colors.heading)}`,
      lines
    });
  }

  if (entries.length === 0) return;

  return {
    title: `${paint(`🧐 [Variable Mismatches]`, colors.heading)} (${paint(data.length, colors.value)}) \n`,
    entries
  };
}