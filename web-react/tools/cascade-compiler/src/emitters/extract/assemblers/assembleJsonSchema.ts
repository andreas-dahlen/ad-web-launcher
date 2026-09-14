import { rawTokenSchema, rawValuesSchema, rawVarsSchema } from '../../../schema/tokenSchema.ts';
import * as z from 'zod';
import type { FormatFileResult } from '../../../types/emitter.types.ts';

export function assembleJsonSchema(): FormatFileResult {

  return {
    outputFile: "metadata/cascade.schema.json",
    content: JSON.stringify(z.toJSONSchema(rawTokenSchema, {
      override: ({ zodSchema, jsonSchema }) => {
        if (zodSchema === rawValuesSchema) {
          jsonSchema.minProperties = 1
        }

        if (zodSchema === rawVarsSchema) {
          jsonSchema.minProperties = 1
        }
      },
    }), null, 2) + '\n',
    kind: "schema"
  }
}