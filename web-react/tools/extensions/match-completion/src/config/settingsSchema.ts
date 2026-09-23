import * as z from 'zod';

export const suggestionsSchema = z.record(
  z.string(),
  z.array(z.string()),
)
export const snippetBindingsSchema = z.array(z.string())

export const languagesSchema = z.array(z.string())