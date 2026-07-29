import type { Issue } from '../../../../shared/tokenUtils/prefixes.ts';
export type SortedIssues = {
  subject: string
  issues: Issue[]
}
export default function analyzeIssues(issues: Issue[]): SortedIssues[] {
  const groups = new Map<string, Issue[]>();

  for (const issue of issues) {
    const existing = groups.get(issue.subject);

    if (existing) {
      existing.push(issue);
    } else {
      groups.set(issue.subject, [issue]);
    }
  }

  const result = [];

  for (const [subject, issues] of groups) {
    result.push({
      subject,
      issues
    });
  }

  return result;
}