import * as z from 'zod'

export const compilerOutputsRecoverySchema = z.object({
  extension: z.boolean().optional(),
  lsp: z.boolean().optional(),
  meta: z.boolean().optional(),
  pathPatches: z.boolean().optional(),
  presets: z.boolean().optional(),
  tokens: z.boolean().optional(),
  schema: z.boolean().optional(),
  package: z.boolean().optional()
})
export const compilerLoggingRecoverySchema = z.object({
  trace: z.boolean().optional(),
  emissions: z.enum(['summary', 'verbose', 'off']).optional(),
})

export const compilerPresetIgnoreRecoverySchema = z.array(z.string())

export const compilerOutputsSchema =
  compilerOutputsRecoverySchema.strict()
export const compilerLoggingSchema =
  compilerLoggingRecoverySchema.strict()

export const compilerPresetIgnoreSchema =
  compilerPresetIgnoreRecoverySchema.transform(
    values => [...new Set(values)]
  )
export const compilerConfigSchema = z.object({
  tokenFolder: z.string().optional(),
  outputs: compilerOutputsSchema.optional(),
  logging: compilerLoggingSchema.optional(),
  presetIgnore: compilerPresetIgnoreSchema.optional()
}).strict()

export const compilerOutputsKeys = Object.keys(
  compilerOutputsRecoverySchema.shape
) as (keyof typeof compilerOutputsRecoverySchema.shape)[]

export const compilerLoggingKeys = Object.keys(compilerLoggingRecoverySchema.shape) as (keyof typeof compilerLoggingRecoverySchema.shape)[]
export const compilerConfigKeys = Object.keys(compilerConfigSchema.shape) as (keyof typeof compilerConfigSchema.shape)[]

//TODO generated json schema for the jsonFile!

// export const compilerOutputsSchema = z.object({
//   extension: z.boolean().optional(),
//   lsp: z.boolean().optional(),
//   meta: z.boolean().optional(),
//   pathPatches: z.boolean().optional(),
//   presets: z.boolean().optional(),
//   tokens: z.boolean().optional(),
//   schema: z.boolean().optional(),
//   package: z.boolean().optional()
// }).strict()

// export const compilerOutputsSchema = compilerOutputsSchema

// export const compilerLoggingSchema = z.object({
//   trace: z.boolean().optional(),
//   emissions: z.enum(['summary', 'verbose', 'off']).optional(),
// }).strict()
// export const compilerPresetIgnoreSchema = z.array(z.string()).transform(values => [...new Set(values)])

