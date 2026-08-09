import { describe, expect, it, vi } from 'vitest'

import { buildData } from '@styleTokens/diagnostics/data/buildData'
import type {
  CssData,
  CssTokenGroup,
} from '@styleTokens/types/compiler.types'
import type { CompilerRun } from '@styleTokens/compiler/tracking/compilerRun'
import type { TokenCache } from '@styleTokens/compiler/tracking/tokenCache'

function createGroup(
  overrides: Partial<CssTokenGroup> = {},
): CssTokenGroup {
  return {
    groupPath: '/tokens/button',
    cssPath: '/components/Button/Button.module.css',
    tokens: [
      {
        name: 'button',
        infix: 'button',
        tokenPath: '/tokens/button/default.jsonc',
        vars: [
          {
            key: 'bg',
            name: 'background',
            values: {},
            effectiveAllowed: ['f'],
          },
        ],
      },
    ],
    ...overrides,
  }
}

function createCssData(
  overrides: Partial<CssData> = {},
): CssData {
  return {
    groupPath: '/tokens/button',
    cssPath: '/components/Button/Button.module.css',
    foundSelectors: ['button'],
    usableSelectors: ['button'],
    tokens: [
      {
        name: 'button',
        infix: 'button',
        tokenPath: '/tokens/button/default.jsonc',
        processed: true,
      },
    ],
    foundFinalVariables: [],
    declaredVariables: [],
    ...overrides,
  }
}

function createCache(
  groups: CssTokenGroup[] = [],
): TokenCache {
  return {
    getGroupByGroupPath: vi.fn((groupPath: string) =>
      groups.find(group => group.groupPath === groupPath),
    ),
  } as unknown as TokenCache
}

function createRun(
  overrides: Partial<{
    missingModules: string[]
    processedGroups: string[]
    cssData: CssData[]
  }> = {},
): CompilerRun {
  const {
    missingModules = [],
    processedGroups = [],
    cssData = [],
  } = overrides

  return {
    getMissingModules: vi.fn(() => missingModules),
    // eslint-disable-next-line unicorn/no-useless-undefined
    getEmitResult: vi.fn(() => undefined),
    getIssues: vi.fn(() => []),
    getProcessedGroupPaths: vi.fn(() => processedGroups),
    getCssData: vi.fn((groupPath: string) =>
      cssData.find(data => data.groupPath === groupPath),
    ),
  } as unknown as CompilerRun
}

describe('[DIAGNOSTICS]', () => {
  describe('buildData', () => {
    it('returns empty diagnostic data when nothing was processed', () => {
      const cache = createCache()
      const run = createRun()

      expect(buildData(cache, run)).toEqual({
        missingClasses: [],
        unusableSelectors: [],
        mismatchedVariables: [],
        invalidVarDeclarations: [],
        missingCssModules: [],
        processedGroupCount: 0,
        generatedFiles: {
          presets: {
            written: [],
            skipped: [],
          },
          tokens: {
            written: [],
            skipped: [],
          },
        },
        issues: [],
      })
    })

    it('counts processed groups', () => {
      const group = createGroup()

      const cache = createCache([group])
      const run = createRun({
        processedGroups: [group.groupPath],
        cssData: [createCssData()],
      })

      const result = buildData(cache, run)

      expect(result.processedGroupCount).toBe(1)
    })

    it('collects missing CSS modules', () => {
      const cache = createCache()

      const run = createRun({
        missingModules: [
          '/tokens/button',
          '/tokens/card',
        ],
      })

      const result = buildData(cache, run)

      expect(result.missingCssModules).toEqual([
        'button',
        'card',
      ])
    })

    it('collects diagnostics from processed CSS data', () => {
      const group = createGroup()

      const cssData = createCssData({
        foundSelectors: [
          'button',
          'invalid',
        ],
        usableSelectors: [
          'button',
        ],
        tokens: [
          {
            name: 'button',
            infix: 'button',
            tokenPath: '/tokens/button/default.jsonc',
            processed: false,
          },
        ],
        foundFinalVariables: [
          '--final-button-unknown',
        ],
        declaredVariables: [
          '--x-button-background',
        ],
      })

      const cache = createCache([group])
      const run = createRun({
        processedGroups: [group.groupPath],
        cssData: [cssData],
      })

      const result = buildData(cache, run)

      expect(result.unusableSelectors).toEqual([
        {
          cssPath: '/components/Button/Button.module.css',
          unusableSelectors: ['invalid'],
        },
      ])

      expect(result.missingClasses).toEqual([
        {
          infix: 'button',
          tokenPath: '/tokens/button/default.jsonc',
          usableSelectors: ['button'],
        },
      ])

      expect(result.mismatchedVariables).toEqual([
        {
          name: 'button',
          infix: 'button',
          missing: ['--final-button-unknown'],
          unused: ['--final-button-background'],
        },
      ])

      expect(result.invalidVarDeclarations).toEqual([
        {
          name: 'button',
          infix: 'button',
          invalid: ['--x-button-background'],
        },
      ])
    })

    it('skips processed groups without CSS data', () => {
      const group = createGroup()

      const cache = createCache([group])
      const run = createRun({
        processedGroups: [group.groupPath],
        cssData: [],
      })

      const result = buildData(cache, run)

      expect(result.processedGroupCount).toBe(1)
      expect(result.missingClasses).toEqual([])
      expect(result.unusableSelectors).toEqual([])
      expect(result.mismatchedVariables).toEqual([])
      expect(result.invalidVarDeclarations).toEqual([])
    })

    it('includes generated file information from the emit result', () => {
      const cache = createCache()

      const run = {
        ...createRun(),
        getEmitResult: vi.fn(() => ({
          writeResult: {
            updated: [
              '/src/shared/generated/presets/button.preset.ts',
              '/src/shared/generated/tokenModules/button.token.ts',
            ],
            skipped: [],
          },
          patchResult: {
            updated: [],
            skipped: [],
          },
        })),
      } as unknown as CompilerRun

      const result = buildData(cache, run)

      expect(result.generatedFiles).toEqual({
        presets: {
          written: ['presets/button.preset.ts'],
          skipped: [],
        },
        tokens: {
          written: ['tokenModules/button.token.ts'],
          skipped: [],
        },
      })
    })
  })
})