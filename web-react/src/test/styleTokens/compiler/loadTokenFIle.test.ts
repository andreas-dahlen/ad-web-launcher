import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { loadTokenFile } from '@styleTokens/compiler/loaders/loadTokenFile'

function createTempDir() {
  return fs.mkdtempSync(
    path.join(os.tmpdir(), 'token-load-test-')
  )
}

function createFile(
  filePath: string,
  content: string,
) {
  fs.mkdirSync(
    path.dirname(filePath),
    { recursive: true },
  )

  fs.writeFileSync(
    filePath,
    content,
  )
}

describe('[COMPILER]', () => {
  describe('loadTokenFile', () => {
    it('loads and parses a token file', () => {
      const dir = createTempDir()
      const filePath = path.join(
        dir,
        'button.jsonc',
      )

      createFile(
        filePath,
        `{
          "background": {
            "f": "black"
          }
        }`,
      )

      const result = loadTokenFile(filePath)

      expect(result.fullPath).toBe(filePath)
      expect(result.json).toEqual({
        background: {
          f: 'black',
        },
      })
      expect(result.errors).toEqual([])
    })

    it('supports JSONC comments', () => {
      const dir = createTempDir()
      const filePath = path.join(
        dir,
        'button.jsonc',
      )

      createFile(
        filePath,
        `{
          // Button background
          "background": {
            "f": "black"
          }
        }`,
      )

      const result = loadTokenFile(filePath)

      expect(result.json).toEqual({
        background: {
          f: 'black',
        },
      })

      expect(result.errors).toEqual([])
    })

    it('returns parse errors without throwing', () => {
      const dir = createTempDir()
      const filePath = path.join(
        dir,
        'broken.jsonc',
      )

      createFile(
        filePath,
        `{
          "background": {
            "f": "black"
        `,
      )

      const result = loadTokenFile(filePath)

      expect(result.fullPath).toBe(filePath)
      expect(result.errors.length).toBeGreaterThan(0)
    })
  })
})