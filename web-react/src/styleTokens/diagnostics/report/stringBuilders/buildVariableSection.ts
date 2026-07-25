import type { DiagnosticSnapshot } from '../../diagnosticService.ts';
import type { ReportEntry, ReportSection } from '../buildReport.ts';

export default function buildVariableSection(snapshot: DiagnosticSnapshot): ReportSection | undefined {
  const entries: ReportEntry[] = [];

  for (const variable of snapshot.mismatchedVariables) {
    const lines: string[] = [];

    if (variable.unused.length > 0) {
      lines.push(
        `🎨 Unused in CSS (${variable.unused.length})`,
        ...variable.unused.map(variable => `   ${variable}`)
      );
    }

    if (variable.missing.length > 0) {
      lines.push(
        `📦 Missing in JSON (${variable.missing.length})`,
        ...variable.missing.map(variable => `   ${variable}`)
      );
    }

    const component =
      variable.name == variable.infix
        ? variable.name
        : `${variable.name}-${variable.infix}`

    entries.push({
      title: `🚮 Component: ${component}`,
      lines
    });
  }

  if (entries.length === 0) return;

  return {
    title: "🧐 Variable mismatches:",
    entries
  };
}