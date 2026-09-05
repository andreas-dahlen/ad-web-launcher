import z from 'zod'
export const compilerConfigSchema = z.object({
  tokenFolder: z.string().optional(),
  outDir: z.string().optional(),
  outputs: z.object({
    extension: z.boolean().optional(),
    lsp: z.boolean().optional(),
    meta: z.boolean().optional(),
    pathPatches: z.boolean().optional(),
    presets: z.boolean().optional(),
    tokens: z.boolean().optional(),
  }).optional(),

  logging: z.object({
    trace: z.boolean().optional(),
    emissions: z.enum(['summary', 'verbose', 'off']).optional(),
  }).optional()
})