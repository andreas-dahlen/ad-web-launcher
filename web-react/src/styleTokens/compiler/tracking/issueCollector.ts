import type { EditScope, IssueGroup, IssueScope, SetIssue } from '../../types/issueCollector.types.ts'

export type IssueCollector = {
  setSubject(subject: string): void
  scope(init: IssueScope): void
  editScope(edit: EditScope): void
  set(issue: SetIssue): void
  flush(): IssueGroup[]
}

export default function createIssueCollector(): IssueCollector {

  const groups = new Map<string, IssueGroup>()

  let currentScope: Partial<IssueScope>
  let subject: string | undefined

  function setSubject(addedSubject: string) {
    subject = addedSubject
    ensureCurrentGroup()
  }

  function scope(init: IssueScope) {
    currentScope = init
  }


  function ensureCurrentGroup(): IssueGroup {
    if (!subject)
      throw new Error("setSubject() must be called before set()")

    let group = groups.get(subject)

    if (!group) {
      group = {
        subject,
        issues: []
      }

      groups.set(subject, group)
    }

    return group
  }

  function set(issue: SetIssue) {
    const group = ensureCurrentGroup()
    const { path, value, context } = currentScope
    if (!path || !value) {
      throw new Error("scope() must initialize path and value")
    }
    group.issues.push({
      path,
      value,
      context,
      ...issue
    })
  }

  function editScope(edit: EditScope) {
    currentScope = {
      path: edit.path ?? currentScope.path,
      value: edit.value ?? currentScope.value,
      context: edit.context ?? currentScope.context
    }
  }

  function flush(): IssueGroup[] {
    // eslint-disable-next-line unicorn/prefer-iterator-to-array
    const result = [...groups.values()]

    groups.clear()

    currentScope = { path: "", value: "", context: "" }
    subject = undefined

    return result
  }

  return {
    setSubject,
    scope,
    editScope,
    set,
    flush
  }
}

export function mergeIssueGroups(groups: IssueGroup[]): IssueGroup[] {
  const merged = new Map<string, IssueGroup>()

  for (const group of groups) {
    const existing = merged.get(group.subject)

    if (existing) {
      existing.issues.push(...group.issues)
    } else {
      merged.set(group.subject, {
        subject: group.subject,
        issues: [...group.issues]
      })
    }
  }

  // eslint-disable-next-line unicorn/prefer-iterator-to-array
  return [...merged.values()]
}

const nullIssueCollector: IssueCollector = {
  setSubject() { },
  set() { },
  scope() { },
  editScope() { },
  flush() { return [] },
}

export function createNullIssueCollector() {
  return nullIssueCollector
}