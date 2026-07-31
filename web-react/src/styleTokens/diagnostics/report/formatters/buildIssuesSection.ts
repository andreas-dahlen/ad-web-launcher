import type { ReportEntry, ReportSection } from '../buildReport.ts';
import formatLogPath from '../../print/formatLogPath.ts';
import type { AnalyzedIssueGroup } from '../../data/analyzers/analyzeIssues.ts';

export default function buildIssuesSection(groups: AnalyzedIssueGroup[]): ReportSection | undefined {
  const entries: ReportEntry[] = []

  for (const group of groups) {
    const lines: string[] = []

    for (const context of group.contexts) {
      const title = context.context ?? "general"
      lines.push(`🚑 ${title} (${context.issues.length})`)

      for (const issue of context.issues) {
        const value = issue.after
          ? `${issue.value} → ${issue.after}`
          : issue.value

        lines.push(
          `   [${value}] - [${issue.reason}] - File: ${formatLogPath(issue.path)}`
        )
      }

      if (context.context) {
        lines.push("")
      }
    }
    if (group.contexts.length > 0) {
      entries.push({
        title: `❌ issue: ${group.subject} (${group.contexts.length})`,
        lines
      })
    }
  }

  if (entries.length === 0)
    return

  return {
    title: `💩 [JSON Issues] Subjects(${groups.length})\n`,
    entries
  }
}