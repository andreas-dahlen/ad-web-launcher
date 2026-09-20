import { beforeEach, describe, expect, it, vi } from 'vitest'

import { build } from '../../src/entries/build.ts'

const resolveConfigMock = vi.hoisted(() => vi.fn())
const initializeCompilerMock = vi.hoisted(() => vi.fn())

vi.mock('../../src/entries/config/resolveConfig.ts', () => ({
  resolveConfig: resolveConfigMock,
}))

vi.mock('../../src/compiler/compilerService.ts', () => ({
  initializeCompiler: initializeCompilerMock,
}))

const config = {
  projectRoot: '/project',
  tokenPath: '/project/tokens',
}

const compiler = {}

describe('[ENTRIES]', () => {
  describe('build', () => {
    beforeEach(() => {
      vi.clearAllMocks()

      resolveConfigMock.mockReturnValue(config)
      initializeCompilerMock.mockReturnValue(compiler)
    })

    it('resolves build configuration', () => {
      build('/project')

      expect(resolveConfigMock).toHaveBeenCalledWith(
        '/project',
        {
          willEmitCss: true,
          initialProcessing: false,
        },
      )
    })

    it('initializes and returns the compiler', () => {
      expect(build('/project')).toBe(compiler)

      expect(initializeCompilerMock).toHaveBeenCalledWith(config)
    })
  })
})