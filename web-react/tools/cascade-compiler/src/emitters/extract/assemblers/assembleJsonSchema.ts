import { rawTokenSchema, rawValuesSchema, rawVarsSchema } from '../../../schema/tokenSchema.ts';
import * as z from 'zod';

export function assembleJsonSchema(): string {

  return JSON.stringify(z.toJSONSchema(rawTokenSchema, {
    override: ({ zodSchema, jsonSchema }) => {
      if (zodSchema === rawValuesSchema) {
        jsonSchema.minProperties = 1
      }

      if (zodSchema === rawVarsSchema) {
        jsonSchema.minProperties = 1
      }
    },
  }), null, 2) + '\n'

}