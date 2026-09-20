import path from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { resolveConfig } from '../../../src/entries/config/resolveConfig.ts'

const loadCompilerConfigMock = vi.hoisted(() => vi.fn())
const findPackageRootMock = vi.hoisted(() => vi.fn())

vi.mock('../../../src/entries/config/loadCompilerConfig.ts', () => ({
  loadCompilerConfig: loadCompilerConfigMock,
}))

vi.mock('../../../src/entries/config/findPackageRoot.ts', () => ({
  findPackageRoot: findPackageRootMock,
}))

describe('[ENTRIES > CONFIG]', () => {
  describe('resolveConfig', () => {
    beforeEach(() => {
      vi.clearAllMocks()

      findPackageRootMock.mockReturnValue('/package')

      loadCompilerConfigMock.mockReturnValue({
        config: {},
        issues: [],
      })
    })

    it('resolves config defaults', () => {
      const result = resolveConfig('/project')

      expect(result).toEqual({
        config: {
          projectRoot: '/project',
          tokenPath: path.resolve('/project', 'src/tokens'),
          logging: {
            trace: false,
            emissions: 'summary',
          },
          outputs: {
            extension: false,
            lsp: false,
            meta: false,
            pathPatches: false,
            presets: false,
            tokens: false,
            schema: false,
            package: false,
          },
          presetIgnore: [],
          internal: {
            generatedPath: path.join('/package', 'generated'),
            willEmitCss: false,
            initialProcessing: true,
          },
        },
        issues: [],
      })
    })

    it('resolves tokenFolder relative to the project root', () => {
      loadCompilerConfigMock.mockReturnValue({
        config: {
          tokenFolder: 'tokens',
        },
        issues: [],
      })

      const result = resolveConfig('/project')

      expect(result.config.tokenPath).toBe(
        path.resolve('/project', 'tokens'),
      )
    })

    it('uses configured logging values', () => {
      loadCompilerConfigMock.mockReturnValue({
        config: {
          logging: {
            trace: true,
            emissions: 'verbose',
          },
        },
        issues: [],
      })

      expect(resolveConfig('/project').config.logging).toEqual({
        trace: true,
        emissions: 'verbose',
      })
    })

    it('uses internal logging over config logging', () => {
      loadCompilerConfigMock.mockReturnValue({
        config: {
          logging: {
            trace: false,
            emissions: 'summary',
          },
        },
        issues: [],
      })

      expect(
        resolveConfig('/project', {
          trace: true,
          emissions: 'off',
        }).config.logging,
      ).toEqual({
        trace: true,
        emissions: 'off',
      })
    })

    it('uses configured output flags', () => {
      loadCompilerConfigMock.mockReturnValue({
        config: {
          outputs: {
            extension: true,
            lsp: true,
            meta: true,
            pathPatches: true,
            presets: true,
            tokens: true,
            schema: true,
            package: true,
          },
        },
        issues: [],
      })

      expect(resolveConfig('/project').config.outputs).toEqual({
        extension: true,
        lsp: true,
        meta: true,
        pathPatches: true,
        presets: true,
        tokens: true,
        schema: true,
        package: true,
      })
    })

    it('resolves configured preset ignores', () => {
      loadCompilerConfigMock.mockReturnValue({
        config: {
          presetIgnore: ['legacy', 'experimental'],
        },
        issues: [],
      })

      expect(resolveConfig('/project').config.presetIgnore).toEqual([
        'legacy',
        'experimental',
      ])
    })

    it('uses internal options when provided', () => {
      loadCompilerConfigMock.mockReturnValue({
        config: {},
        issues: [],
      })

      const result = resolveConfig('/project', {
        generatedPath: '/generated',
        willEmitCss: true,
        initialProcessing: false,
      })

      expect(result.config.internal).toEqual({
        generatedPath: '/generated',
        willEmitCss: true,
        initialProcessing: false,
      })
    })

    it('preserves config issues', () => {
      const issues = [
        {
          subject: 'Configuration',
          issues: [
            {
              path: 'tokenFolder',
              value: 'invalid',
              reason: 'invalid value',
            },
          ],
        },
      ]

      loadCompilerConfigMock.mockReturnValue({
        config: {},
        issues,
      })

      const result = resolveConfig('/project')

      expect(result.issues).toBe(issues)
    })

    it('resolves the generated path from the package root by default', () => {
      const result = resolveConfig('/project')

      expect(result.config.internal.generatedPath).toBe(
        path.join('/package', 'generated'),
      )
    })
  })
})