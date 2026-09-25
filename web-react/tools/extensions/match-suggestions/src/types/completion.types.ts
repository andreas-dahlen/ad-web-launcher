import type { languagesSchema, completionsSchema } from '../schemas/settingsSchema.ts'
import * as z from "zod"
export type SuggestionsSchema = z.infer<typeof completionsSchema>
export type LanguagesSchema = z.infer<typeof languagesSchema>


export type CompletionConfig = {
  languages: LanguagesSchema | null
  completions: SuggestionsSchema | null
}

export type Match = {
  matcher: string
  completions: string[]
}

export type PreparedMatches = {
  triggers: string[]
  byTrigger: Map<string, Match[]>
}