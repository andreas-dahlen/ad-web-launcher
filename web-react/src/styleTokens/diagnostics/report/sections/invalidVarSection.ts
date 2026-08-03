
import { colors, paint } from '../../../consoleUtils/utils.ts';
import type { InvalidVarDeclaration } from '../../../types/diagnostics.types.ts';
import type { ReportEntry, ReportSection } from '../buildReport.ts';

export function invalidVarSection(data: InvalidVarDeclaration[]): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  for (const variable of data) {
    const lines: string[] = [];

    if (variable.invalid.length > 0) {
      lines.push(
        ` ${paint(`🎨 Invalid declarations:`, colors.error)} (${paint(variable.invalid.length, colors.value)})`,
        ...variable.invalid.map(variable => `    ${paint(variable, colors.symbol)}`)
      );
    }

    const component =
      variable.name == variable.infix
        ? variable.name
        : `${variable.name}-${variable.infix}`

    entries.push({
      title: ` 🧩 ${paint(`Component: `, colors.subHeading)}${paint(component, colors.heading)}`,
      lines
    })
  }

  if (entries.length === 0) return;

  return {
    title: `${paint(` 🩻 [Invalid Variable Declarations]`, colors.heading)} (${paint(data.length, colors.value)}) \n`,
    entries
  }
}