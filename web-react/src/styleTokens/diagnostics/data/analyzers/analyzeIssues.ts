import { mergeIssueGroups } from '../../../compiler/state/issueCollector.ts'
import type { Issue, IssueGroup } from '../../../types/issueCollector.types'

export type IssueContextGroup = {
  context?: string
  issues: Issue[]
}

export type AnalyzedIssueGroup = {
  subject: string
  contexts: IssueContextGroup[]
}

export default function analyzeIssues(groups: IssueGroup[]): AnalyzedIssueGroup[] {
  const merged = mergeIssueGroups(groups)

  return merged
    .filter(group => group.issues.length > 0)
    .map(group => {
      const contexts = new Map<string | undefined, Issue[]>()

      for (const issue of group.issues) {
        const existing = contexts.get(issue.context)

        if (existing) {
          existing.push(issue)
        } else {
          contexts.set(issue.context, [issue])
        }
      }

      const groupedContexts = [...contexts].map(([context, issues]) => ({
        context,
        issues
      }))

      groupedContexts.sort((a, b) => {
        if (a.context === undefined)
          return 1

        if (b.context === undefined)
          return -1

        return 0
      })

      return {
        subject: group.subject,
        contexts: groupedContexts
      }
    })
}