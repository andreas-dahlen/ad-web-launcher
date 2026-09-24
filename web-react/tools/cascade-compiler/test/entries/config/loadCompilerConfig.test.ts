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

    it('throws when config is missing', () => {
      existsSyncMock.mockReturnValue(false)

      expect(() => loadCompilerConfig('/project')).toThrow(
        "couldn't find a cascade.config.json file",
      )

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
        config: {
          tokenFolder: 'tokens',
        },
        issues: [],
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

    it('recovers when config does not match the schema', () => {
      existsSyncMock.mockReturnValue(true)
      readFileSyncMock.mockReturnValue(`
        {
          "tokenFolder": 123
        }
      `)

      const result = loadCompilerConfig('/project')

      expect(result.config).toBeDefined()
      expect(result.issues).toHaveLength(1)
    })
  })
})