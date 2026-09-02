import type { ReportEntry, ReportSection } from '../buildReport.ts';
import { colors, formatLogPath, paint } from '../../../utils/string.ts';
import type { AnalyzedIssueGroup } from '../../../types/diagnostics.types.ts';

export function issuesSection(groups: AnalyzedIssueGroup[]): ReportSection | undefined {
  const entries: ReportEntry[] = []

  for (const group of groups) {
    const lines: string[] = []

    for (const context of group.contexts) {
      const title = context.context ?? "general"
      lines.push(`🚑 ${paint(title, colors.subHeading)} (${paint(context.issues.length, colors.value)})`)

      for (const issue of context.issues) {
        const value = issue.after
          ? `${paint(issue.value, colors.symbol)} → ${paint(issue.after, colors.symbol)}`
          : `${paint(issue.value, colors.symbol)}`

        lines.push(
          `   [${value}] - ${paint(issue.reason, colors.error)} - ${paint("File", colors.muted)}: ${paint(formatLogPath(issue.path), colors.file)}`
        )
      }

      if (context.context) {
        lines.push("")
      }
    }
    if (group.contexts.length > 0) {
      entries.push({
        title: `❌ ${paint(group.subject, colors.heading)} (${paint(group.contexts.length, colors.value)})`,
        lines
      })
    }
  }

  if (entries.length === 0)
    return

  return {
    title: `${paint(`💩 [JSON Issues]`, colors.heading)} (${paint(groups.length, colors.value)})\n`,
    entries
  }
}