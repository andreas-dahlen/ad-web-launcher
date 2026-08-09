import { describe, expect, it } from 'vitest'
import postcss from 'postcss'

import { walkModule } from '@styleTokens/postCss/resolvers/walkModule'

function parseCss(css: string) {
  return postcss.parse(css)
}

describe('[POSTCSS]', () => {
  describe('walkModule', () => {
    it('finds expected token rules', () => {
      const root = parseCss(`
        .button-first {
          color: red;
        }

        .button-second {
          color: blue;
        }

        .other {
          color: green;
        }
      `)

      const result = walkModule(
        root,
        ['button-first', 'button-second'],
      )

      expect(result.rules).toEqual(expect.any(Map))

      // eslint-disable-next-line unicorn/prefer-iterator-to-array
      expect([...result.rules.keys()]).toEqual([
        '.button-first',
        '.button-second',
      ])
    })

    it('ignores rules that are not expected token rules', () => {
      const root = parseCss(`
        .button-first {
          color: red;
        }

        .other {
          color: green;
        }
      `)

      const result = walkModule(root, ['button-first'])

      expect(result.rules.has('.button-first')).toBe(true)
      expect(result.rules.has('.other')).toBe(false)
    })

    it('collects every class selector for diagnostics', () => {
      const root = parseCss(`
        .button-first {
          color: red;
        }

        .button-second {
          color: blue;
        }

        .other {
          color: green;
        }
      `)

      const result = walkModule(root, [])

      expect(result.foundSelectors).toEqual([
        'button-first',
        'button-second',
        'other',
      ])
    })

    it('collects only usable class identifiers', () => {
      const root = parseCss(`
        .button-first {
          color: red;
        }

        .button_$state {
          color: blue;
        }

        .button-state.active {
          color: green;
        }
      `)

      const result = walkModule(root, [])

      expect(result.usableSelectors).toEqual([
        'button_$state',
        'active',
      ])
    })

    it('does not mark invalid class selectors as usable', () => {
      const root = parseCss(String.raw`
        .123button {
          color: red;
        }

        .button:first-child {
          color: blue;
        }

        .button\\.invalid {
          color: green;
        }
      `)

      const result = walkModule(root, [])

      expect(result.foundSelectors).toContain('123button')
      expect(result.usableSelectors).not.toContain('123button')
    })

    it('finds declared token variables', () => {
      const root = parseCss(`
        .button {
          --s-button-color: red;
          --m-button-color: blue;
          --something-else: green;
        }
      `)

      const result = walkModule(root, ['button'])

      expect(result.declaredVariables).toEqual([
        '--s-button-color',
        '--m-button-color',
      ])
    })

    it('finds final variables used by normal declarations', () => {
      const root = parseCss(`
        .button {
          color: var(--final-button-color);
          background: var(--final-button-background);
        }
      `)

      const result = walkModule(root, ['button'])

      expect(result.foundFinalVariables).toEqual([
        '--final-button-color',
        '--final-button-background',
      ])
    })

    it('finds final variables with fallbacks', () => {
      const root = parseCss(`
        .button {
          color: var(--final-button-color, red);
        }
      `)

      const result = walkModule(root, ['button'])

      expect(result.foundFinalVariables).toEqual([
        '--final-button-color',
      ])
    })

    it('creates preset reset data from final variables used by normal declarations', () => {
      const root = parseCss(`
        .button {
          color: var(--final-button-color);
          background: var(--final-button-background);
        }
      `)

      const result = walkModule(root, ['button'])

      const rule = root.first

      expect(rule?.type).toBe('rule')

      if (rule?.type !== 'rule') {
        return
      }

      expect(result.presetResetData.get(rule)).toEqual(
        new Set([
          '--final-button-color',
          '--final-button-background',
        ]),
      )
    })

    it('does not create preset reset data for final variables declared as custom properties', () => {
      const root = parseCss(`
        .button {
          --s-button-color: var(--final-button-color);
        }
      `)

      const result = walkModule(root, ['button'])

      const rule = root.first

      expect(rule?.type).toBe('rule')

      if (rule?.type !== 'rule') {
        return
      }

      expect(result.foundFinalVariables).toEqual([
        '--final-button-color',
      ])

      expect(result.presetResetData.has(rule)).toBe(false)
    })

    it('finds the final variable when a declaration has a fallback', () => {
      const root = parseCss(`
        .button {
          color: var(--final-button-color, var(--f-button-color));
        }
      `)

      const result = walkModule(root, ['button'])

      expect(result.foundFinalVariables).toEqual([
        '--final-button-color'
      ])
    })

    it('does not treat unrelated variables as final variables', () => {
      const root = parseCss(`
        .button {
          color: var(--s-button-color);
          background: var(--m-button-background);
          border: var(--random-value);
        }
      `)

      const result = walkModule(root, ['button'])

      expect(result.foundFinalVariables).toEqual([])
      expect(result.presetResetData.size).toBe(0)
    })

    it('returns empty collections when nothing is found', () => {
      const root = parseCss(`
        .other {
          color: red;
        }
      `)

      const result = walkModule(root, ['button'])

      expect(result.rules.size).toBe(0)
      expect(result.foundSelectors).toEqual(['other'])
      expect(result.usableSelectors).toEqual(['other'])
      expect(result.foundFinalVariables).toEqual([])
      expect(result.declaredVariables).toEqual([])
      expect(result.presetResetData.size).toBe(0)
    })
  })
})