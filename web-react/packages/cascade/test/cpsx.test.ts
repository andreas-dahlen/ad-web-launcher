import { describe, expect, it } from 'vitest'

import { cpsx } from '../src/index.ts'

describe('[CPSX]', () => {

  it('returns an empty string when presets are undefined', () => {
    expect(
      cpsx(undefined, {})
    ).toBe('')
  })

  it('resolves a preset to its CSS module class', () => {
    expect(
      cpsx(
        ['primary'],
        {
          primary: 'button-primary'
        }
      )
    ).toBe('button-primary')
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
    ).toBe('button-primary button-secondary')
  })

  it('returns an empty string when presets is empty', () => {
    expect(
      cpsx([], {})
    ).toBe('')
  })

})