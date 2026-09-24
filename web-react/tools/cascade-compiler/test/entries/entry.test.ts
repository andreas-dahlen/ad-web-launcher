import { beforeEach, describe, expect, it, vi } from 'vitest'

import { compiler } from '../../src/entries/entry.ts'

const findProjectRootMock = vi.hoisted(() => vi.fn())
const cssMock = vi.hoisted(() => vi.fn())
const buildMock = vi.hoisted(() => vi.fn())
const watchMock = vi.hoisted(() => vi.fn())

vi.mock('../../src/entries/config/findProjectRoot.ts', () => ({
  findProjectRoot: findProjectRootMock,
}))

vi.mock('../../src/entries/css.ts', () => ({
  css: cssMock,
}))

vi.mock('../../src/entries/build.ts', () => ({
  build: buildMock,
}))

vi.mock('../../src/entries/watch/watch.ts', () => ({
  watch: watchMock,
}))

describe('[ENTRIES]', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    findProjectRootMock.mockReturnValue('/project')
  })

  describe('compiler.runCss', () => {
    it('resolves the project root and runs CSS compilation', () => {
      const result = {}

      cssMock.mockReturnValue(result)

      expect(compiler.runCss('/project/src')).toBe(result)

      expect(findProjectRootMock).toHaveBeenCalledWith(
        '/project/src',
      )
      expect(cssMock).toHaveBeenCalledWith('/project')
    })
  })

  describe('compiler.runBuild', () => {
    it('resolves the project root and runs the build', () => {
      const result = {}

      buildMock.mockReturnValue(result)

      expect(compiler.runBuild('/project/src')).toBe(result)

      expect(findProjectRootMock).toHaveBeenCalledWith(
        '/project/src',
      )
      expect(buildMock).toHaveBeenCalledWith('/project')
    })
  })

  describe('compiler.runWatch', () => {
    it('resolves the project root and starts watching', () => {
      compiler.runWatch('/project/src')

      expect(findProjectRootMock).toHaveBeenCalledWith(
        '/project/src',
      )
      expect(watchMock).toHaveBeenCalledWith('/project')
    })
  })
})