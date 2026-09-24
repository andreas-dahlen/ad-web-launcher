import { describe, expect, it } from 'vitest'

import { formatJsonSchema } from '../../../src/emitters/compose/format/formatJsonSchema.ts'

describe('[EMITTERS]', () => {
  describe('formatJsonSchema', () => {
    it('creates a schema file result', () => {
      const jsonSchema = '{"$schema":"test"}'

      expect(formatJsonSchema(jsonSchema)).toEqual({
        outputFile: 'metadata/cascade.schema.json',
        content: jsonSchema,
        kind: 'extension',
      })
    })
  })
})