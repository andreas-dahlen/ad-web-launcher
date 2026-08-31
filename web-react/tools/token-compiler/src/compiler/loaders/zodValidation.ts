import * as z from "zod"

const validPrefixSchema = z.enum([
  'o',
  's',
  'm',
  'p',
  't',
  'f',
])

export const rawVariableSchema = z.object({
  name: z.string().optional(),
  allowed: z.array(validPrefixSchema).optional(),
  exclude: z.array(validPrefixSchema).optional(),
  values: z
    .object({
      o: z.string().optional(),
      s: z.string().optional(),
      m: z.string().optional(),
      p: z.string().optional(),
      t: z.string().optional(),
      f: z.string().optional(),
    })
    .optional(),
})

export const rawTokenSchema = z.object({
  component: z.string(),
  infix: z.string().optional(),
  alwaysAllowed: z.array(validPrefixSchema).optional(),
  vars: z.record(z.string(), rawVariableSchema),
})