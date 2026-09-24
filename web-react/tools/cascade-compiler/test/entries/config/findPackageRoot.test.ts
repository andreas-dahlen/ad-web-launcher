import { beforeEach, describe, expect, it, vi } from 'vitest'

import { findPackageRoot } from '../../../src/entries/config/findPackageRoot.ts'

const dirnameMock = vi.hoisted(() => vi.fn())
const basenameMock = vi.hoisted(() => vi.fn())
const fileURLToPathMock = vi.hoisted(() => vi.fn())

vi.mock('node:path', () => ({
  default: {
    dirname: dirnameMock,
    basename: basenameMock,
  },
}))

vi.mock('node:url', () => ({
  fileURLToPath: fileURLToPathMock,
}))

describe('[ENTRIES > CONFIG]', () => {
  describe('findPackageRoot', () => {
    beforeEach(() => {
      vi.clearAllMocks()

      fileURLToPathMock.mockReturnValue('/package/dist/entries/config')
      dirnameMock.mockImplementation((directory: string) => {
        if (directory === '/package/dist/entries/config') {
          return '/package/dist/entries'
        }

        if (directory === '/package/dist/entries') {
          return '/package/dist'
        }

        if (directory === '/package/dist') {
          return '/package'
        }

        return directory
      })

      basenameMock.mockImplementation((directory: string) =>
        directory.split('/').pop(),
      )
    })

    it('returns the package root from the dist directory', () => {
      expect(findPackageRoot()).toBe('/package')
    })

    it('throws when resolving from source code', () => {
      fileURLToPathMock.mockReturnValue('/package/src/entries/config')

      dirnameMock.mockImplementation((directory: string) => {
        if (directory === '/package/src/entries/config') {
          return '/package/src/entries'
        }

        if (directory === '/package/src/entries') {
          return '/package/src'
        }

        return directory
      })

      expect(() => findPackageRoot()).toThrow(
        'Cannot resolve Cascade package root from source code.',
      )
    })

    it('throws when the dist directory cannot be found', () => {
      fileURLToPathMock.mockReturnValue('/package/lib/entries/config')

      dirnameMock.mockImplementation((directory: string) => {
        if (directory === '/package/lib/entries/config') {
          return '/package/lib/entries'
        }

        if (directory === '/package/lib/entries') {
          return '/package/lib'
        }

        if (directory === '/package/lib') {
          return '/package'
        }

        if (directory === '/package') {
          return '/'
        }

        return directory
      })

      basenameMock.mockImplementation((directory: string) => {
        if (directory === '/') {
          return ''
        }

        return directory.split('/').pop()
      })

      expect(() => findPackageRoot()).toThrow(
        'Could not find Cascade package dist directory.',
      )
    })
  })
})