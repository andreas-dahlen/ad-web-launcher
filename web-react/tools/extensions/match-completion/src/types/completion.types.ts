import type { languagesSchema, suggestionsSchema } from '../schemas/settingsSchema.ts'
import * as z from "zod"
export type SuggestionsSchema = z.infer<typeof suggestionsSchema>
export type LanguagesSchema = z.infer<typeof languagesSchema>


export type CompletionConfig = {
  languages: LanguagesSchema | null
  suggestions: SuggestionsSchema | null
}

export type Match = {
  matcher: string
  suggestions: string[]
}

export type PreparedMatches = {
  triggers: string[]
  byTrigger: Map<string, Match[]>
}