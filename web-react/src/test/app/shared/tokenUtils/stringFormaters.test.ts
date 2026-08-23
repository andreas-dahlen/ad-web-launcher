import { describe, expect, it } from 'vitest'

import {
  toKebab,
  toCssVar,
  toCssVarPrefix,
  toPascalCase,
  toCamelCase,
  removeInvalidCharacters,
  prefixLeadingNumber,
  escapeReservedWord,
  normalizeCssValue,
  removeWhitespace,
} from '@shared/tokenUtils/stringFormaters'

describe('[TOKEN UTILS] string formatters', () => {
  describe('toKebab', () => {
    it.each([
      ['buttonColor', 'button-color'],
      ['ButtonColor', 'button-color'],
      ['button', 'button'],
      ['button2Color', 'button2-color'],
      ['BUTTON', 'button'],
    ])('converts %s to %s', (input, expected) => {
      expect(toKebab(input)).toBe(expected)
    })
  })

  describe('toCssVar', () => {
    it('builds a CSS variable from its parts', () => {
      expect(
        toCssVar(
          'final',
          'buttonGroup',
          'backgroundColor',
        ),
      ).toBe('--final-button-group-background-color')
    })

    it('kebab-cases every part', () => {
      expect(
        toCssVar(
          'Fallback',
          'ButtonGroup',
          'backgroundColor',
        ),
      ).toBe('--fallback-button-group-background-color')
    })
  })

  describe('toCssVarPrefix', () => {
    it('builds a CSS variable prefix', () => {
      expect(
        toCssVarPrefix('final', 'buttonGroup'),
      ).toBe('--final-button-group-')
    })
  })

  describe('toCamelCase', () => {
    it.each([
      ['button-color', 'buttonColor'],
      ['button--color', 'buttonColor'],
      ['button-color-name', 'buttonColorName'],
      ['Button-color', 'buttonColor'],
      ['button', 'button'],
    ])('converts %s to %s', (input, expected) => {
      expect(toCamelCase(input)).toBe(expected)
    })
  })

  describe('toPascalCase', () => {
    it.each([
      ['button-color', 'ButtonColor'],
      ['button', 'Button'],
      ['Button-color', 'ButtonColor'],
    ])('converts %s to %s', (input, expected) => {
      expect(toPascalCase(input)).toBe(expected)
    })
  })

  describe('removeInvalidCharacters', () => {
    it('removes characters that are not letters, numbers, or underscores', () => {
      expect(
        removeInvalidCharacters('button-color!@#$%'),
      ).toBe('buttoncolor')
    })

    it('preserves underscores', () => {
      expect(
        removeInvalidCharacters('button_color'),
      ).toBe('button_color')
    })

    it('supports unicode letters and numbers', () => {
      expect(
        removeInvalidCharacters('knapp-åäö-123'),
      ).toBe('knappåäö123')
    })
  })

  describe('prefixLeadingNumber', () => {
    it('prefixes values beginning with a number', () => {
      expect(prefixLeadingNumber('123button')).toBe(
        '_123button',
      )
    })

    it('leaves non-numeric values unchanged', () => {
      expect(prefixLeadingNumber('button123')).toBe(
        'button123',
      )
    })
  })

  describe('escapeReservedWord', () => {
    it.each([
      'break',
      'class',
      'const',
      'function',
      'return',
    ])('prefixes reserved word "%s"', word => {
      expect(escapeReservedWord(word)).toBe(`_${word}`)
    })

    it('leaves normal identifiers unchanged', () => {
      expect(
        escapeReservedWord('button'),
      ).toBe('button')
    })
  })

  describe('normalizeCssValue', () => {
    it('converts values to strings', () => {
      expect(normalizeCssValue(123)).toBe('123')
      expect(normalizeCssValue(true)).toBe('true')
    })

    it('trims surrounding whitespace', () => {
      expect(
        normalizeCssValue('  10px  '),
      ).toBe('10px')
    })

    it('removes a trailing semicolon', () => {
      expect(
        normalizeCssValue('10px;'),
      ).toBe('10px')
    })

    it('removes a trailing semicolon with whitespace', () => {
      expect(
        normalizeCssValue('10px;   '),
      ).toBe('10px')
    })
  })

  describe('removeWhitespace', () => {
    it('removes all whitespace', () => {
      expect(
        removeWhitespace('  foo \n bar \t baz  '),
      ).toBe('foobarbaz')
    })

    it('returns unchanged text when there is no whitespace', () => {
      expect(
        removeWhitespace('foo-bar'),
      ).toBe('foo-bar')
    })
  })
})