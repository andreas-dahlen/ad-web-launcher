import { describe, it, expect } from 'vitest'
import { dasx } from '@shared/sxCompiler/dasx.ts'

describe('[DASX]', () => {
  it('should convert camelCase to kebab-case with data-prefix', () => {
    const input = { userId: '123', isActive: 'yes' }
    const expected = { 'data-user-id': '123', 'data-is-active': 'yes' }

    expect(dasx(input)).toEqual(expected)
  })

  it('should keep boolean values as valid attributes (especially false)', () => {
    const input = { isAvailable: true, isDisabled: false }
    const expected = { 'data-is-available': 'true', 'data-is-disabled': 'false' }

    expect(dasx(input)).toEqual(expected)
  })

  it('should ignore null and undefined but keep numbers', () => {
    const input = { score: 99, ghost: null, shadow: undefined }
    const expected = { 'data-score': '99' }

    expect(dasx(input)).toEqual(expected)
  })

  it('should handle cases where data attr is already attatched', () => {
    const input = { 'data-customAttr': 'test' }
    const expected = { 'data-custom-attr': 'test' }

    expect(dasx(input)).toEqual(expected)
  })

  it('should handle empty objects and not crash', () => {
    expect(dasx({})).toEqual({})
    expect(dasx()).toEqual({})
  })
})