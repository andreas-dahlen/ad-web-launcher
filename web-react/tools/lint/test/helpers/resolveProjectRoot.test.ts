import { describe, expect, it } from 'vitest'
import { resolveProjectRoot } from '../../src/helpers/resolveProjectRoot.ts'

describe('[LINT]', () => {
  describe('resolveProjectRoot', () => {
    it('returns cwd when rootDir is not configured', () => {
      const cwd = '/projects/web-react'

      expect(resolveProjectRoot(cwd, {}))
        .toBe(cwd)
    })

    it('returns cwd when rootDir matches the cwd basename', () => {
      const cwd = '/projects/web-react'

      expect(resolveProjectRoot(cwd, {
        custom: {
          rootDir: 'web-react',
        },
      })).toBe(cwd)
    })

    it('resolves rootDir relative to cwd', () => {
      const cwd = '/projects'

      expect(resolveProjectRoot(cwd, {
        custom: {
          rootDir: 'web-react',
        },
      })).toBe('/projects/web-react')
    })
  })
})