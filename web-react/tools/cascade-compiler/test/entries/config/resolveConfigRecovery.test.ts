import { describe, expect, it } from 'vitest'

import { resolveConfigRecovery } from '../../../src/entries/config/resolveConfigRecovery.ts'

describe('[ENTRIES > CONFIG]', () => {
  describe('resolveConfigRecovery', () => {
    it('recovers valid top-level config values', () => {
      const result = resolveConfigRecovery({
        tokenFolder: 'src/tokens',
      })

      expect(result.config).toEqual({
        tokenFolder: 'src/tokens',
        outputs: undefined,
        logging: undefined,
        presetIgnore: undefined,
      })
    })

    it('recovers valid output values', () => {
      const result = resolveConfigRecovery({
        outputs: {
          extension: true,
          lsp: false,
          meta: true,
          pathPatches: false,
          presets: true,
          tokens: false,
          schema: true,
          package: false,
        },
      })

      expect(result.config.outputs).toEqual({
        extension: true,
        lsp: false,
        meta: true,
        pathPatches: false,
        presets: true,
        tokens: false,
        schema: true,
        package: false,
      })
    })

    it('recovers valid logging values', () => {
      const result = resolveConfigRecovery({
        logging: {
          trace: true,
          emissions: 'verbose',
        },
      })

      expect(result.config.logging).toEqual({
        trace: true,
        emissions: 'verbose',
      })
    })

    it('recovers valid presetIgnore values', () => {
      const result = resolveConfigRecovery({
        presetIgnore: ['legacy', 'experimental'],
      })

      expect(result.config.presetIgnore).toEqual([
        'legacy',
        'experimental',
      ])
    })

    it('reports invalid top-level config keys', () => {
      const result = resolveConfigRecovery({
        tokenFolder: 'src/tokens',
        unknown: true,
        anotherUnknown: 'value',
      })

      expect(result.issues).toEqual([
        {
          subject: 'Config Recovery',
          issues: [
            {
              path: 'cascade.config.json',
              value: 'unknown, anotherUnknown',
              reason: 'found invalid config key',
              context: undefined,
            },
          ],
        },
      ])
    })

    it('reports invalid output keys', () => {
      const result = resolveConfigRecovery({
        outputs: {
          extension: true,
          unknown: false,
          anotherUnknown: true,
        },
      })

      expect(result.issues).toEqual([
        {
          subject: 'Config Recovery',
          issues: [
            {
              path: 'cascade.config.json',
              value: 'unknown, anotherUnknown',
              reason: 'found invalid outputs key',
              context: undefined,
            },
          ],
        },
      ])
    })

    it('reports invalid logging keys', () => {
      const result = resolveConfigRecovery({
        logging: {
          trace: true,
          unknown: false,
          anotherUnknown: true,
        },
      })

      expect(result.issues).toEqual([
        {
          subject: 'Config Recovery',
          issues: [
            {
              path: 'cascade.config.json',
              value: 'unknown, anotherUnknown',
              reason: 'found invalid logging key',
              context: undefined,
            },
          ],
        },
      ])
    })

    it('reports a non-array presetIgnore value', () => {
      const result = resolveConfigRecovery({
        presetIgnore: 'legacy',
      })

      expect(result.issues).toEqual([
        {
          subject: 'Config Recovery',
          issues: [
            {
              path: 'cascade.config.json',
              value: 'string',
              reason: 'presetIgnore needs to be an array',
              context: undefined,
            },
          ],
        },
      ])
    })

    it('reports invalid presetIgnore values individually', () => {
      const result = resolveConfigRecovery({
        presetIgnore: [
          'legacy',
          123,
          true,
          null,
        ],
      })

      expect(result.issues).toEqual([
        {
          subject: 'Config Recovery',
          issues: [
            {
              path: 'cascade.config.json',
              value: '123',
              reason: 'invalid presetIgnore value',
              context: undefined,
            },
            {
              path: 'cascade.config.json',
              value: 'true',
              reason: 'invalid presetIgnore value',
              context: undefined,
            },
            {
              path: 'cascade.config.json',
              value: 'null',
              reason: 'invalid presetIgnore value',
              context: undefined,
            },
          ],
        },
      ])
    })

    it('reports an invalid tokenFolder value', () => {
      const result = resolveConfigRecovery({
        tokenFolder: 123,
      })

      expect(result.config.tokenFolder).toBeUndefined()

      expect(result.issues).toEqual([
        {
          subject: 'Config Recovery',
          issues: [
            {
              path: 'cascade.config.json',
              value: '123',
              reason: 'tokenFolder needs to be of type string',
              context: undefined,
            },
          ],
        },
      ])
    })

    it('recovers valid output values when some output values are invalid', () => {
      const result = resolveConfigRecovery({
        outputs: {
          extension: true,
          lsp: 'true',
          meta: false,
          schema: 123,
        },
      })

      expect(result.config.outputs).toEqual({
        extension: true,
        meta: false,
      })

      expect(result.issues).toEqual([
        {
          subject: 'Config Recovery',
          issues: [
            {
              path: 'cascade.config.json',
              value: 'true',
              reason: 'outputs values need to be of type boolean',
              context: undefined,
            },
            {
              path: 'cascade.config.json',
              value: '123',
              reason: 'outputs values need to be of type boolean',
              context: undefined,
            },
          ],
        },
      ])
    })

    it('recovers valid logging values when some logging values are invalid', () => {
      const result = resolveConfigRecovery({
        logging: {
          trace: true,
          emissions: 'invalid',
        },
      })

      expect(result.config.logging).toEqual({
        trace: true,
      })

      expect(result.issues).toEqual([
        {
          subject: 'Config Recovery',
          issues: [
            {
              path: 'cascade.config.json',
              value: 'invalid',
              reason: 'invalid logging value for emissions',
              context: undefined,
            },
          ],
        },
      ])
    })

    it('recovers valid presetIgnore values when some values are invalid', () => {
      const result = resolveConfigRecovery({
        presetIgnore: [
          'legacy',
          123,
          'experimental',
          true,
        ],
      })

      expect(result.config.presetIgnore).toEqual([
        'legacy',
        'experimental',
      ])

      expect(result.issues).toEqual([
        {
          subject: 'Config Recovery',
          issues: [
            {
              path: 'cascade.config.json',
              value: '123',
              reason: 'invalid presetIgnore value',
              context: undefined,
            },
            {
              path: 'cascade.config.json',
              value: 'true',
              reason: 'invalid presetIgnore value',
              context: undefined,
            },
          ],
        },
      ])
    })

    it('deduplicates recovered presetIgnore values', () => {
      const result = resolveConfigRecovery({
        presetIgnore: [
          'legacy',
          'legacy',
          'experimental',
          'legacy',
        ],
      })

      expect(result.config.presetIgnore).toEqual([
        'legacy',
        'experimental',
      ])
    })

    it('recovers valid values while reporting invalid keys', () => {
      const result = resolveConfigRecovery({
        tokenFolder: 'src/tokens',
        unknown: true,
        outputs: {
          extension: true,
          unknown: false,
        },
        logging: {
          trace: true,
          unknown: false,
        },
        presetIgnore: ['legacy'],
      })

      expect(result.config).toEqual({
        tokenFolder: 'src/tokens',
        outputs: {
          extension: true,
        },
        logging: {
          trace: true,
        },
        presetIgnore: ['legacy'],
      })

      expect(result.issues).toEqual([
        {
          subject: 'Config Recovery',
          issues: [
            {
              path: 'cascade.config.json',
              value: 'unknown',
              reason: 'found invalid config key',
              context: undefined,
            },
            {
              path: 'cascade.config.json',
              value: 'unknown',
              reason: 'found invalid outputs key',
              context: undefined,
            },
            {
              path: 'cascade.config.json',
              value: 'unknown',
              reason: 'found invalid logging key',
              context: undefined,
            },
          ],
        },
      ])
    })

    it('recovers an empty config', () => {
      const result = resolveConfigRecovery({})

      expect(result.config).toEqual({
        tokenFolder: undefined,
        outputs: undefined,
        logging: undefined,
        presetIgnore: undefined,
      })

      expect(result.issues).toEqual([])
    })

    it('recovers config containing empty nested objects', () => {
      const result = resolveConfigRecovery({
        outputs: {},
        logging: {},
        presetIgnore: [],
      })

      expect(result.config).toEqual({
        tokenFolder: undefined,
        outputs: {},
        logging: {},
        presetIgnore: [],
      })

      expect(result.issues).toEqual([])
    })

    it('reports every invalid value from a partially recoverable config', () => {
      const result = resolveConfigRecovery({
        tokenFolder: 123,
        outputs: {
          extension: 'yes',
          lsp: true,
          meta: 42,
        },
        logging: {
          trace: 'yes',
          emissions: 'invalid',
        },
        presetIgnore: [
          'legacy',
          123,
          false,
        ],
      })

      expect(result.config).toEqual({
        tokenFolder: undefined,
        outputs: {
          lsp: true,
          package: undefined,
          pathPatches: undefined,
          presets: undefined,
          schema: undefined,
          tokens: undefined,
        },
        logging: {},
        presetIgnore: ['legacy'],
      })

      expect(result.issues).toEqual([
        {
          subject: 'Config Recovery',
          issues: [
            {
              path: 'cascade.config.json',
              value: '123',
              reason: 'tokenFolder needs to be of type string',
              context: undefined,
            },
            {
              path: 'cascade.config.json',
              value: 'yes',
              reason: 'outputs values need to be of type boolean',
              context: undefined,
            },
            {
              path: 'cascade.config.json',
              value: '42',
              reason: 'outputs values need to be of type boolean',
              context: undefined,
            },
            {
              path: 'cascade.config.json',
              value: 'yes',
              reason: 'invalid logging value for trace',
              context: undefined,
            },
            {
              path: 'cascade.config.json',
              value: 'invalid',
              reason: 'invalid logging value for emissions',
              context: undefined,
            },
            {
              path: 'cascade.config.json',
              value: '123',
              reason: 'invalid presetIgnore value',
              context: undefined,
            },
            {
              path: 'cascade.config.json',
              value: 'false',
              reason: 'invalid presetIgnore value',
              context: undefined,
            },
          ],
        },
      ])
    })
  })
})