import { assert } from '@styleTokens/compiler/processing/assertions';
import type { RawToken, TokenGroup } from '@styleTokens/types/compiler.types';
import { describe, expect, it } from 'vitest';

const path = '/tokens/button.jsonc';

describe('[COMPILER]', () => {
  describe('assert.token', () => {
    it.each([
      {
        description: 'rejects empty component',
        json: {
          component: '',
        },
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
        assert.token([], json as unknown as RawToken, path)
      ).toThrow(error);
    });


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
        )
      ).not.toThrow();
    });


    it('rejects JSON parse errors', () => {
      expect(() =>
        assert.token(
          [{ error: 1 } as never],
          { component: 'button', vars: {} },
          path,
        )
      ).toThrow('Invalid JSON');
    });
  });


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
        value: {
          name: '',
        },
        error: 'name must be a non empty string',
      },
      {
        description: 'rejects allowed as non array',
        value: {
          allowed: 'f',
        },
        error: 'allowed must be an array',
      },
      {
        description: 'rejects exclude as non array',
        value: {
          exclude: 'f',
        },
        error: 'exclude must be an array',
      },
      {
        description: 'rejects values as array',
        value: {
          values: [],
        },
        error: 'values must be an object',
      },
    ])('$description', ({ value, error }) => {
      expect(() =>
        assert.variable(
          'background',
          value,
          path,
        )
      ).toThrow(error);
    });


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
        )
      ).not.toThrow();
    });
  });


  describe('assert.hasCssPath', () => {
    it('accepts groups with cssPath', () => {
      const group = {
        groupPath: '/tokens/button',
        cssPath: '/css/Button.module.css',
        tokens: [],
      };

      expect(() =>
        assert.hasCssPath(group)
      ).not.toThrow();
    });


    it('rejects groups without cssPath', () => {
      const group = {
        groupPath: '/tokens/button',
        tokens: [],
      } as TokenGroup;

      expect(() =>
        assert.hasCssPath(group)
      ).toThrow('has no cssPath');
    });
  });
});