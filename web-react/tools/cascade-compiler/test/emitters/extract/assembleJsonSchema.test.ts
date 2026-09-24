import { describe, expect, it } from 'vitest'

import { assembleJsonSchema } from '../../../src/emitters/extract/assemblers/assembleJsonSchema.ts'

describe('[EMITTERS > EXTRACT > ASSEMBLERS]', () => {
  describe('assembleJsonSchema', () => {
    it('returns the token schema as formatted JSON', () => {
      const result = assembleJsonSchema()

      expect(result.endsWith('\n')).toBe(true)
      expect(() => JSON.parse(result)).not.toThrow()
    })

    it('requires vars to contain at least one property', () => {
      const schema = JSON.parse(assembleJsonSchema())

      expect(schema.properties.vars.minProperties).toBe(1)
    })

    it('requires each variable values object to contain at least one property', () => {
      const schema = JSON.parse(assembleJsonSchema())

      const values = schema.properties.vars.additionalProperties.properties.values

      expect(values.minProperties).toBe(1)
    })
  })
})