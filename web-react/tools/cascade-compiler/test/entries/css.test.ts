import { beforeEach, describe, expect, it, vi } from 'vitest'

import { css } from '../../src/entries/css.ts'

const resolveConfigMock = vi.hoisted(() => vi.fn())
const initializeCompilerMock = vi.hoisted(() => vi.fn())

vi.mock('../../src/entries/config/resolveConfig.ts', () => ({
  resolveConfig: resolveConfigMock,
}))

vi.mock('../../src/compiler/compilerService.ts', () => ({
  initializeCompiler: initializeCompilerMock,
}))

const config = {
  tokenPath: '/project/tokens',
}

const configData = {
  config,
  issues: []
}

const compiler = {}

describe('[ENTRIES]', () => {
  describe('css', () => {
    beforeEach(() => {
      vi.clearAllMocks()

      resolveConfigMock.mockReturnValue(configData)
      initializeCompilerMock.mockReturnValue(compiler)
    })

    it('resolves CSS configuration', () => {
      css('/project')

      expect(resolveConfigMock).toHaveBeenCalledWith(
        '/project',
        {
          willEmitCss: true,
          generatedPath: null,
          initialProcessing: false,
        },
      )
    })

    it('returns the compiler and token folder', () => {
      expect(css('/project')).toEqual({
        compiler,
        tokenFolder: '/project/tokens',
      })

      expect(initializeCompilerMock).toHaveBeenCalledWith(configData)
    })
  })
})