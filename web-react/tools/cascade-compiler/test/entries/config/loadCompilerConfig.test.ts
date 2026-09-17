import path from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { loadCompilerConfig } from '../../../src/entries/config/loadCompilerConfig.ts'

const existsSyncMock = vi.hoisted(() => vi.fn())
const readFileSyncMock = vi.hoisted(() => vi.fn())

vi.mock('node:fs', () => ({
  default: {
    existsSync: existsSyncMock,
    readFileSync: readFileSyncMock,
  },
}))

describe('[ENTRIES > CONFIG]', () => {
  describe('loadCompilerConfig', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('returns an empty object when config is missing', () => {
      existsSyncMock.mockReturnValue(false)

      expect(loadCompilerConfig('/project')).toEqual({})
      expect(readFileSyncMock).not.toHaveBeenCalled()
    })

    it('loads a valid JSONC config', () => {
      existsSyncMock.mockReturnValue(true)
      readFileSyncMock.mockReturnValue(`
        {
          // compiler settings
          "tokenFolder": "tokens"
        }
      `)

      expect(loadCompilerConfig('/project')).toEqual({
        tokenFolder: 'tokens',
      })

      expect(readFileSyncMock).toHaveBeenCalledWith(
        path.join('/project', 'cascade.config.json'),
        'utf8',
      )
    })

    it('throws when config contains invalid JSONC', () => {
      existsSyncMock.mockReturnValue(true)
      readFileSyncMock.mockReturnValue('{ invalid }')

      expect(() => loadCompilerConfig('/project')).toThrow(
        'Invalid JSONC in /project/cascade.config.json:',
      )
    })

    it('throws when config does not match the schema', () => {
      existsSyncMock.mockReturnValue(true)
      readFileSyncMock.mockReturnValue(`
        {
          "tokenFolder": 123
        }
      `)

      expect(() => loadCompilerConfig('/project')).toThrow()
    })
  })
})