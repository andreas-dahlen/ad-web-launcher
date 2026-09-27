import * as z from 'zod'

export const snippetSchema = z.object({
  prefix: z.string(),
  body: z.array(z.string()),
  description: z.string().optional(),
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),
})

export const snippetsSchema = z.record(
  z.string(),
  snippetSchema,
)