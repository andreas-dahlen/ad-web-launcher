import * as z from 'zod'

export const extensionDataSchema = z.array(
  z.object({
    cssPath: z.string(),
    // eslint-disable-next-line unicorn/max-nested-calls
    variables: z.array(z.string()),
  }),
)

export type ExtensionData = z.infer<typeof extensionDataSchema>