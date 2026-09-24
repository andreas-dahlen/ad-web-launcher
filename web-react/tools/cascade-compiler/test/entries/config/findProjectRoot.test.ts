import { beforeEach, describe, expect, it, vi } from 'vitest'

import { findProjectRoot } from '../../../src/entries/config/findProjectRoot.ts'
import path from 'node:path'

const existsSyncMock = vi.hoisted(() => vi.fn())

vi.mock('node:fs', () => ({
  existsSync: existsSyncMock,
}))

describe('[ENTRIES > CONFIG]', () => {
  describe('findProjectRoot', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('returns the start directory when it contains cascade.config.json', () => {
      existsSyncMock.mockReturnValue(true)

      expect(findProjectRoot('/project')).toBe('/project')
    })

    it('returns the nearest parent containing cascade.config.json', () => {
      existsSyncMock.mockImplementation(
        (configPath: string) => configPath === '/project/cascade.config.json',
      )

      expect(findProjectRoot('/project/src/components')).toBe('/project')
    })

    it('searches through parent directories', () => {
      existsSyncMock
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(true)

      expect(findProjectRoot('/project/src/components')).toBe('/project')

      expect(existsSyncMock).toHaveBeenCalledTimes(3)
      expect(existsSyncMock).toHaveBeenNthCalledWith(
        1,
        '/project/src/components/cascade.config.json',
      )
      expect(existsSyncMock).toHaveBeenNthCalledWith(
        2,
        '/project/src/cascade.config.json',
      )
      expect(existsSyncMock).toHaveBeenNthCalledWith(
        3,
        '/project/cascade.config.json',
      )
    })

    it('throws when cascade.config.json cannot be found', () => {
      existsSyncMock.mockReturnValue(false)

      expect(() => findProjectRoot('/project/src/components')).toThrow(
        'Could not find cascade.config.json from /project/src/components',
      )
    })

    it('resolves the start directory before searching', () => {
      existsSyncMock.mockReturnValue(true)

      expect(findProjectRoot('./project')).toBe(
        path.resolve('./project'),
      )
    })
  })
})