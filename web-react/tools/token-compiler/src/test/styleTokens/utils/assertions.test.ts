import { assert } from '../../../utils/assertions.js'
import type {
  CssDataTokenGroup,
  RawToken,
  TokenGroup,
} from '../../../types/compiler.types.js'
import { describe, expect, it } from 'vitest'
import type { ParseError } from 'jsonc-parser'

const path = '/tokens/button.jsonc'

describe('[COMPILER]', () => {
  describe('assert.token', () => {
    it.each([
      {
        description: 'rejects empty component',
        json: { component: '' },
        error: '"component" must be a non empty string',
      },
      {
        description: 'rejects missing component',
        json: {},
        error: '"component" must be a non empty string',
      },
      {
        description: 'rejects vars as array',
        json: {
          component: 'button',
          vars: [],
        },
        error: '"vars" must be an object',
      },
      {
        description: 'rejects alwaysAllowed as non array',
        json: {
          component: 'button',
          alwaysAllowed: 'f',
        },
        error: '"alwaysAllowed" must be an array',
      },
      {
        description: 'rejects infix as non string',
        json: {
          component: 'button',
          infix: true,
        },
        error: '"infix" must be a string',
      },
    ])('$description', ({ json, error }) => {
      expect(() =>
        assert.token(
          [],
          json as unknown as RawToken,
          path,
        ),
      ).toThrow(error)
    })

    it('accepts valid token data', () => {
      expect(() =>
        assert.token(
          [],
          {
            component: 'button',
            infix: 'default',
            vars: {},
            alwaysAllowed: ['f'],
          },
          path,
        ),
      ).not.toThrow()
    })

    it('rejects JSON parse errors', () => {
      const errors = [
        { error: 1 },
      ] as unknown as ParseError[]

      expect(() =>
        assert.token(
          errors,
          { component: 'button', vars: {} },
          path,
        ),
      ).toThrow('Invalid JSON')
    })
  })

  describe('assert.variable', () => {
    it.each([
      {
        description: 'rejects primitive variable',
        value: 'hello',
        error: 'must be an object',
      },
      {
        description: 'rejects array variable',
        value: [],
        error: 'must be an object',
      },
      {
        description: 'rejects empty name',
        value: { name: '' },
        error: 'name must be a non empty string',
      },
      {
        description: 'rejects allowed as non array',
        value: { allowed: 'f' },
        error: 'allowed must be an array',
      },
      {
        description: 'rejects exclude as non array',
        value: { exclude: 'f' },
        error: 'exclude must be an array',
      },
      {
        description: 'rejects values as array',
        value: { values: [] },
        error: 'values must be an object',
      },
    ])('$description', ({ value, error }) => {
      expect(() =>
        assert.variable(
          'background',
          value,
          path,
        ),
      ).toThrow(error)
    })

    it('accepts valid variables', () => {
      expect(() =>
        assert.variable(
          'background',
          {
            name: 'Background',
            allowed: ['f'],
            exclude: ['p'],
            values: {
              f: 'black',
            },
          },
          path,
        ),
      ).not.toThrow()
    })
  })

  describe('assert.cssVariable', () => {
    it.each([
      '--button-background',
      '--foo',
      '--_private',
      '--foo_123-bar',
    ])('accepts valid CSS variable %s', value => {
      expect(() =>
        assert.cssVariable(value),
      ).not.toThrow()
    })

    it.each([
      'button-background',
      '-button-background',
      '--',
      '--1button',
      '--foo!',
      '--foo bar',
    ])('rejects invalid CSS variable %s', value => {
      expect(() =>
        assert.cssVariable(value),
      ).toThrow('is not a CSS custom property')
    })
  })

  describe('assert.hasCssPath', () => {
    it('accepts groups with cssPath', () => {
      const group = {
        groupPath: '/tokens/button',
        cssPath: '/css/Button.module.css',
        tokens: [],
      }

      expect(() =>
        assert.hasCssPath(group),
      ).not.toThrow()
    })

    it('rejects undefined groups', () => {
      expect(() =>
        assert.hasCssPath(undefined),
      ).toThrow('has no cssPath')
    })

    it('rejects groups without cssPath', () => {
      const group = {
        groupPath: '/tokens/button',
        tokens: [],
      } as TokenGroup

      expect(() =>
        assert.hasCssPath(group),
      ).toThrow('has no cssPath')
    })
  })

  describe('assert.groupsHaveCssPath', () => {
    it('accepts groups with cssPath', () => {
      const groups = [
        {
          groupPath: '/tokens/button',
          cssPath: '/css/Button.module.css',
          tokens: [],
        },
        {
          groupPath: '/tokens/input',
          cssPath: '/css/Input.module.css',
          tokens: [],
        },
      ] as TokenGroup[]

      expect(() =>
        assert.groupsHaveCssPath(groups),
      ).not.toThrow()
    })

    it('rejects a group without cssPath', () => {
      const groups = [
        {
          groupPath: '/tokens/button',
          cssPath: '/css/Button.module.css',
          tokens: [],
        },
        {
          groupPath: '/tokens/input',
          tokens: [],
        },
      ] as TokenGroup[]

      expect(() =>
        assert.groupsHaveCssPath(groups),
      ).toThrow('Token group "/tokens/input" has no cssPath')
    })

    it('returns without error for an empty group list', () => {
      expect(() =>
        assert.groupsHaveCssPath([]),
      ).not.toThrow()
    })
  })

  describe('assert.groupsHaveCssData', () => {
    it('accepts groups with cssData', () => {
      const groups = [
        {
          groupPath: '/tokens/button',
          cssPath: '/css/Button.module.css',
          tokens: [],
          cssData: {},
        },
        {
          groupPath: '/tokens/input',
          cssPath: '/css/Input.module.css',
          tokens: [],
          cssData: {},
        },
      ] as unknown as CssDataTokenGroup[]

      expect(() =>
        assert.groupsHaveCssData(groups),
      ).not.toThrow()
    })

    it('rejects a group without cssData', () => {
      const groups = [
        {
          groupPath: '/tokens/button',
          cssPath: '/css/Button.module.css',
          tokens: [],
          cssData: {},
        },
        {
          groupPath: '/tokens/input',
          cssPath: '/css/Input.module.css',
          tokens: [],
        },
      ] as unknown as CssDataTokenGroup[]

      expect(() =>
        assert.groupsHaveCssData(groups),
      ).toThrow(
        'A token in tokenGroups "/tokens/input" has no cssData',
      )
    })

    it('returns without error for an empty group list', () => {
      expect(() =>
        assert.groupsHaveCssData([]),
      ).not.toThrow()
    })
  })
})