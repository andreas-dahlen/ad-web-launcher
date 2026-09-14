import { describe, expect, it } from 'vitest'

import { svsx } from '../src/index.ts'
import { prefixPriority } from '../src/functions/utils/svsxHelpers.ts'
import type { TokenComponent } from '../src/index.ts'

const component: TokenComponent = {
  component: 'button',
  vars: {
    button: {
      background: {
        name: 'background',
        allowed: prefixPriority
      },
      padding: {
        name: 'padding',
        allowed: ['p', 't'] as const
      }
    },

    thumb: {
      color: {
        name: 'color',
        allowed: ['s', 'm'] as const
      }
    }
  }
}

describe('[SVSX]', () => {
  it('maps unprefixed primary values to the preset layer', () => {
    expect(
      svsx(
        {
          background: 'red',
          padding: '8px'
        },
        component
      )
    ).toEqual({
      '--p-button-background': 'red',
      '--p-button-padding': '8px'
    })
  })

  it('maps explicitly prefixed values to their prefix layer', () => {
    expect(
      svsx(
        {
          't:background': 'blue',
          'o:background': 'green'
        },
        component
      )
    ).toEqual({
      '--t-button-background': 'blue',
      '--o-button-background': 'green'
    })
  })

  it('accepts every prefix declared by the prefix authority', () => {
    const input = Object.fromEntries(
      prefixPriority.map(prefix => [
        `${prefix}:background`,
        prefix
      ])
    )

    const result = svsx(input, component)

    for (const prefix of prefixPriority) {
      expect(
        result[`--${prefix}-button-background`]
      ).toBe(prefix)
    }
  })

  it('ignores a prefix that is not in the prefix authority', () => {
    expect(
      svsx(
        {
          'x:background': 'red'
        },
        component
      )
    ).toEqual({})
  })

  it('ignores a valid prefix when the variable does not allow it', () => {
    expect(
      svsx(
        {
          's:padding': '8px'
        },
        component
      )
    ).toEqual({})
  })

  it('supports named groups', () => {
    expect(
      svsx(
        {
          thumb: {
            's:color': 'red'
          }
        },
        component
      )
    ).toEqual({
      '--s-thumb-color': 'red'
    })
  })

  it('combines primary and named group values', () => {
    expect(
      svsx(
        {
          background: 'red',
          thumb: {
            'm:color': 'blue'
          }
        },
        component
      )
    ).toEqual({
      '--p-button-background': 'red',
      '--m-thumb-color': 'blue'
    })
  })

  it('normalizes CSS values', () => {
    expect(
      svsx(
        {
          background: '  red;  '
        },
        component
      )
    ).toEqual({
      '--p-button-background': 'red'
    })
  })

  it('ignores null and undefined values', () => {
    expect(
      svsx(
        {
          background: null,
          padding: undefined
        },
        component
      )
    ).toEqual({})
  })

  it('ignores an unknown primary variable', () => {
    expect(
      svsx(
        {
          doesNotExist: 'red'
        },
        component
      )
    ).toEqual({})
  })

  it('ignores an unknown named group', () => {
    expect(
      svsx(
        {
          thumbz: {
            color: 'red'
          }
        },
        component
      )
    ).toEqual({})
  })

  it('returns empty output when the primary group is missing', () => {
    const brokenComponent: TokenComponent = {
      ...component,
      component: 'missing'
    }

    expect(
      svsx(
        {
          background: 'red'
        },
        brokenComponent
      )
    ).toEqual({})
  })
})