import { describe, expect, it } from 'vitest'

import { cpsx } from '@shared/sxCompiler/cpsx.ts'

describe('[CPSX]', () => {
  it('returns an empty array when presets are undefined', () => {
    expect(
      cpsx(undefined, {})
    ).toEqual([])
  })

  it('resolves a preset to its CSS module class', () => {
    expect(
      cpsx(
        ['primary'],
        {
          primary: 'button-primary'
        }
      )
    ).toEqual([
      'button-primary'
    ])
  })

  it('resolves multiple presets in order', () => {
    expect(
      cpsx(
        ['primary', 'secondary'],
        {
          primary: 'button-primary',
          secondary: 'button-secondary'
        }
      )
    ).toEqual([
      'button-primary',
      'button-secondary'
    ])
  })

  it('returns an empty array when presets is empty', () => {
    expect(
      cpsx([], {})
    ).toEqual([])
  })
})