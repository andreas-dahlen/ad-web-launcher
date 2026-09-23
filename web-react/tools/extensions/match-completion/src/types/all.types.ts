import type { languagesSchema, snippetBindingsSchema, suggestionsSchema } from '../config/settingsSchema.ts'
import * as z from "zod"
export type SuggestionsSchema = z.infer<typeof suggestionsSchema>
export type SnippetBindingsSchema = z.infer<typeof snippetBindingsSchema>
export type LanguagesSchema = z.infer<typeof languagesSchema>


export type Config = {
  languages: LanguagesSchema | null
  suggestions: SuggestionsSchema | null
  snippetBindings: SnippetBindingsSchema | null
}



export type Match = {
  matcher: string
  suggestions: string[]
}

export type PreparedMatches = {
  triggers: string[]
  byTrigger: Map<string, Match[]>
}