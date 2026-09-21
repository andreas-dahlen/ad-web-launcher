export type Config = {
  languages: string[]
  suggestions: Record<string, string[]>
}

export type Match = {
  matcher: string
  suggestions: string[]
}

export type PreparedMatches = {
  triggers: string[]
  byTrigger: Map<string, Match[]>
}