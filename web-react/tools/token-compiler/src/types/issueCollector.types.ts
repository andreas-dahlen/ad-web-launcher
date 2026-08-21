export type Issue = {
  path: string
  value: string
  reason: string
  context?: string
  after?: string
}

export type IssueGroup = {
  subject: string
  issues: Issue[]
}

export type SetIssue = {
  reason: string
  after?: string
  value?: string
}

export type IssueScope = {
  path: string
  value: string
  context?: string
}

export type EditScope = {
  path?: string
  value?: string
  context?: string
}