import type { Issue } from './prefixes.ts';

export default function createIssueCollector(subject: string, original: string, path: string, prop?: string) {
  const issues: Issue[] = []

  function setIssue(reason: string, property?: string) {
    issues.push({ subject, name: original, property: property ?? prop, reason, path })
  }

  function addIssues(newIssues: Issue[]) {
    issues.push(...newIssues)
  }

  function flushIssues() {
    const result = [...issues];
    issues.length = 0;
    return result;
  }
  return {
    setIssue,
    addIssues,
    flushIssues
  }
}