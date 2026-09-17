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
    })

    it('throws when tokenFolder is missing', () => {
      loadCompilerConfigMock.mockReturnValue({})

      expect(() => resolveConfig('/project')).toThrow(
        "Couldn't resolve token path in either cascade.config.json",
      )
    })

    it('resolves tokenFolder relative to the project root', () => {
      loadCompilerConfigMock.mockReturnValue({
        tokenFolder: 'tokens',
      })

      const config = resolveConfig('/project')

      expect(config.tokenPath).toBe(
        path.resolve('/project', 'tokens'),
      )
    })

    it('resolves outDir relative to the project root', () => {
      loadCompilerConfigMock.mockReturnValue({
        tokenFolder: 'tokens',
        outDir: 'dist',
      })

      const config = resolveConfig('/project')

      expect(config.outPath).toBe(
        path.resolve('/project', 'dist'),
      )
    })

    it('uses null when outDir is not configured', () => {
      loadCompilerConfigMock.mockReturnValue({
        tokenFolder: 'tokens',
      })

      expect(resolveConfig('/project').outPath).toBeNull()
    })

    it('uses internal outPath over the configured outDir', () => {
      loadCompilerConfigMock.mockReturnValue({
        tokenFolder: 'tokens',
        outDir: 'dist',
      })

      const config = resolveConfig('/project', {
        outPath: '/internal/output',
      })

      expect(config.outPath).toBe('/internal/output')
    })

    it('uses internal generatedPath over the package default', () => {
      loadCompilerConfigMock.mockReturnValue({
        tokenFolder: 'tokens',
      })

      const config = resolveConfig('/project', {
        generatedPath: '/generated',
      })

      expect(config.generatedPath).toBe('/generated')
    })

    it('uses config logging when internal logging is not provided', () => {
      loadCompilerConfigMock.mockReturnValue({
        tokenFolder: 'tokens',
        logging: {
          trace: true,
          emissions: 'verbose',
        },
      })

      expect(resolveConfig('/project').logging).toEqual({
        trace: true,
        emissions: 'verbose',
      })
    })

    it('uses internal logging over config logging', () => {
      loadCompilerConfigMock.mockReturnValue({
        tokenFolder: 'tokens',
        logging: {
          trace: false,
          emissions: 'summary',
        },
      })

      expect(
        resolveConfig('/project', {
          trace: true,
          emissions: 'off',
        }).logging,
      ).toEqual({
        trace: true,
        emissions: 'off',
      })
    })

    it('defaults logging when neither config nor internal values are provided', () => {
      loadCompilerConfigMock.mockReturnValue({
        tokenFolder: 'tokens',
      })

      expect(resolveConfig('/project').logging).toEqual({
        trace: false,
        emissions: 'summary',
      })
    })

    it('uses configured output flags', () => {
      loadCompilerConfigMock.mockReturnValue({
        tokenFolder: 'tokens',
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
      })

      expect(resolveConfig('/project').outputs).toEqual({
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

    it('defaults output flags to false', () => {
      loadCompilerConfigMock.mockReturnValue({
        tokenFolder: 'tokens',
      })

      expect(resolveConfig('/project').outputs).toEqual({
        extension: false,
        lsp: false,
        meta: false,
        pathPatches: false,
        presets: false,
        tokens: false,
        schema: false,
        package: false,
      })
    })

    it('defaults internal options', () => {
      loadCompilerConfigMock.mockReturnValue({
        tokenFolder: 'tokens',
      })

      expect(resolveConfig('/project').internal).toEqual({
        willEmitCss: false,
        initialProcessing: true,
      })
    })

    it('uses internal options when provided', () => {
      loadCompilerConfigMock.mockReturnValue({
        tokenFolder: 'tokens',
      })

      expect(
        resolveConfig('/project', {
          willEmitCss: true,
          initialProcessing: false,
        }).internal,
      ).toEqual({
        willEmitCss: true,
        initialProcessing: false,
      })
    })
  })
})