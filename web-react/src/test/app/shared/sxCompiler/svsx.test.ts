import { describe, expect, it, vi } from 'vitest'

import { svsx } from '@shared/sxCompiler/svsx.ts'
import { prefixPriority } from '@shared/tokenUtils/prefixes.ts'
import type {
  TokenComponent
} from '@shared/tokenUtils/compiler.types.ts'

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

  it('rejects a prefix that is not in the prefix authority', () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => { })

    expect(
      svsx(
        {
          'x:background': 'red'
        },
        component
      )
    ).toEqual({})

    expect(warn).toHaveBeenCalledWith(
      '[svsx] Invalid prefix "x".'
    )

    warn.mockRestore()
  })

  it('rejects a valid prefix when the variable does not allow it', () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => { })

    expect(
      svsx(
        {
          's:padding': '8px'
        },
        component
      )
    ).toEqual({})

    expect(warn).toHaveBeenCalledWith(
      '[svsx] Prefix "s" not allowed for "padding".'
    )

    warn.mockRestore()
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

  it('warns and ignores an unknown primary variable', () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => { })

    expect(
      svsx(
        {
          doesNotExist: 'red'
        },
        component
      )
    ).toEqual({})

    expect(warn).toHaveBeenCalledWith(
      '[svsx] Unknown style key "doesNotExist" in "button".'
    )

    warn.mockRestore()
  })

  it('warns and ignores an unknown named group', () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => { })

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

    expect(warn).toHaveBeenCalledWith(
      '[svsx] Unknown group "thumbz".'
    )

    warn.mockRestore()
  })

  it('warns and returns empty output when the primary group is missing', () => {
    const warn = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => { })

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

    expect(warn).toHaveBeenCalledWith(
      '[svsx] Missing primary group "missing".'
    )

    warn.mockRestore()
  })
})