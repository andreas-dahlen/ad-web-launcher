import z from 'zod'
export const compilerConfigSchema = z.object({
  tokenFolder: z.string().optional(),
  outDir: z.string().optional(),
  mute: z.boolean().optional(),
})