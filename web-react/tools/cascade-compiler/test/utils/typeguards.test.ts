import { describe, expect, it } from 'vitest'

import { asArray, asObject } from '../../src/utils/typeGuards.ts'

describe('asObject', () => {
  it('returns an object', () => {
    const value = { foo: 'bar' }

    expect(asObject(value)).toBe(value)
  })

  it('returns an empty object', () => {
    const value = {}

    expect(asObject(value)).toBe(value)
  })

  it('returns undefined for null', () => {
    expect(asObject(null)).toBeUndefined()
  })

  it('returns undefined for arrays', () => {
    expect(asObject([])).toBeUndefined()
  })

  it('returns undefined for strings', () => {
    expect(asObject('value')).toBeUndefined()
  })

  it('returns undefined for numbers', () => {
    expect(asObject(123)).toBeUndefined()
  })

  it('returns undefined for booleans', () => {
    expect(asObject(true)).toBeUndefined()
  })

  it('returns undefined for undefined', () => {
    expect(asObject(undefined)).toBeUndefined()
  })
})

describe('asArray', () => {
  it('returns an array', () => {
    const value = ['foo', 'bar']

    expect(asArray(value)).toBe(value)
  })

  it('returns an empty array', () => {
    const value: unknown[] = []

    expect(asArray(value)).toBe(value)
  })

  it('accepts arrays containing mixed values', () => {
    const value = ['foo', 123, null, {}, true]

    expect(asArray(value)).toBe(value)
  })

  it('returns undefined for null', () => {
    expect(asArray(null)).toBeUndefined()
  })

  it('returns undefined for objects', () => {
    expect(asArray({})).toBeUndefined()
  })

  it('returns undefined for strings', () => {
    expect(asArray('value')).toBeUndefined()
  })

  it('returns undefined for numbers', () => {
    expect(asArray(123)).toBeUndefined()
  })

  it('returns undefined for booleans', () => {
    expect(asArray(true)).toBeUndefined()
  })

  it('returns undefined for undefined', () => {
    expect(asArray(undefined)).toBeUndefined()
  })
})