import type { SortedIssues } from '../../data/analyzers/analyzeIssues.ts';
import type { ReportEntry, ReportSection } from '../buildReport.ts';

export default function buildIssuesSection(issues: SortedIssues[]): ReportSection | undefined {

  const entries: ReportEntry[] = [];


  console.log(entries.length, "ENTRIES")

  for (const entry of issues) {
    const lines: string[] = [];

    if (entry.subject.length > 0) {
      for (const issue of entry.issues) {

        lines.push(`${issue.name}.${issue.property}: ${issue.reason}`)
        // [`${issue.name}.${issue.property}: ${issue.reason}`]
        // lines.push(issue.path)
      }

    }
    entries.push({
      title: `❌ issue: ${entry.subject}`,
      lines
    })
    console.log(entry.subject)
  }
  if (entries.length === 0) return;

  return {
    title: ` ⚠️ [Validation Issues] (${issues.length}) \n`,
    entries
  }
}