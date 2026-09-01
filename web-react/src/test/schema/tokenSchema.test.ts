import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { prefixPriority } from '../../../oldSharedUtils/prefixes.js'

const schemaPath = path.resolve(
  './src/styleTokens/schema/token.schema.json',
)

const schema = JSON.parse(
  readFileSync(schemaPath, 'utf8'),
)

const prefixes = [...prefixPriority]

describe('[TOKEN SCHEMA]', () => {
  describe('structure', () => {
    it('requires component and vars', () => {
      expect(schema.required).toEqual([
        'component',
        'vars',
      ])
    })

    it('defines the expected top-level properties', () => {
      expect(Object.keys(schema.properties)).toEqual([
        'component',
        'infix',
        'alwaysAllowed',
        'vars',
      ])
    })

    it('does not allow additional top-level properties', () => {
      expect(schema.additionalProperties).toBe(false)
    })
  })

  describe('prefix definitions', () => {
    it('uses the canonical prefix set for alwaysAllowed', () => {
      expect(schema.properties.alwaysAllowed.items.enum)
        .toEqual(prefixes)
    })

    it('uses the canonical prefix set for variable allowed', () => {
      expect(schema.$defs.variable.properties.allowed.items.enum)
        .toEqual(prefixes)
    })

    it('uses the canonical prefix set for variable exclude', () => {
      expect(schema.$defs.variable.properties.exclude.items.enum)
        .toEqual(prefixes)
    })

    it('defines value properties for every prefix', () => {
      const values = schema.$defs.variable.properties.values.properties

      expect(new Set(Object.keys(values)))
        .toEqual(new Set(prefixes))
    })

    it('does not define value properties outside the canonical prefix set', () => {
      const values = schema.$defs.variable.properties.values.properties

      expect(Object.keys(values))
        .toHaveLength(prefixes.length)
    })
  })

  describe('variable definition', () => {
    const variable = schema.$defs.variable

    it('requires no properties', () => {
      expect(variable.required).toBeUndefined()
    })

    it('does not allow additional properties', () => {
      expect(variable.additionalProperties).toBe(false)
    })

    it('defines the expected properties', () => {
      expect(Object.keys(variable.properties)).toEqual([
        'name',
        'allowed',
        'exclude',
        'values',
      ])
    })

    it('requires at least one allowed prefix when allowed is present', () => {
      expect(variable.properties.allowed.minItems).toBe(1)
    })

    it('requires at least one excluded prefix when exclude is present', () => {
      expect(variable.properties.exclude.minItems).toBe(1)
    })

    it('requires at least one value when values is present', () => {
      expect(variable.properties.values.minProperties).toBe(1)
    })

    it('does not allow unknown value prefixes', () => {
      expect(variable.properties.values.additionalProperties)
        .toBe(false)
    })
  })
})