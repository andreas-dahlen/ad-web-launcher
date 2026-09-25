import type { snippetBindingsSchema } from '../schemas/settingsSchema.ts'
import * as z from 'zod'
import type { snippetSchema, snippetsSchema } from '../schemas/snippetSchema.ts'

export type SnippetBindingsSchema = z.infer<typeof snippetBindingsSchema>

export type SnippetConfig = {
  snippetBindings: SnippetBindingsSchema | null
  path: string
}

export type Snippet = z.infer<typeof snippetSchema>
export type Snippets = z.infer<typeof snippetsSchema>