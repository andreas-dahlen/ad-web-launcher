import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { patchFiles } from '../../src/emitters/write/patchFiles.ts'

describe('[EMITTER]', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'style-tokens-patch-'),
    )
  })

  afterEach(() => {
    fs.rmSync(tempDir, {
      recursive: true,
      force: true,
    })
  })

  describe('patchFiles', () => {
    it('skips files that do not exist', () => {
      const result = patchFiles(
        [
          {
            outputFile: 'missing.css',
            content: '/* generated */',
            kind: 'css',
          },
        ],
        tempDir,
      )

      expect(result).toEqual({
        written: [],
        skipped: [{ kind: 'css', outputFile: 'missing.css' }],
      })
    })

    it('skips files that already contain the patch', () => {
      const filePath = path.join(tempDir, 'button.css')

      const content = `/* generated */
.button {
  color: red;
}`

      fs.writeFileSync(filePath, content)

      const result = patchFiles(
        [
          {
            outputFile: 'button.css',
            content: '/* generated */',
            kind: 'css',
          },
        ],
        tempDir,
      )

      expect(result).toEqual({
        written: [],
        skipped: [{ kind: 'css', outputFile: 'button.css' }],
      })

      expect(fs.readFileSync(filePath, 'utf8')).toBe(content)
    })

    it('prepends a patch to an existing file', () => {
      const filePath = path.join(tempDir, 'button.css')

      const current = `.button {
  color: red;
}`

      fs.writeFileSync(filePath, current)

      const result = patchFiles(
        [
          {
            outputFile: 'button.css',
            content: '/* generated */',
            kind: 'css',
          },
        ],
        tempDir,
      )

      expect(result).toEqual({
        written: [{ kind: 'css', outputFile: 'button.css' }],
        skipped: [],
      })

      expect(fs.readFileSync(filePath, 'utf8')).toBe(
        `/* generated */
${current}`,
      )
    })

    it('processes multiple files independently', () => {
      const updatedPath = path.join(tempDir, 'updated.css')
      const skippedPath = path.join(tempDir, 'skipped.css')

      fs.writeFileSync(
        updatedPath,
        '.button {}',
      )

      fs.writeFileSync(
        skippedPath,
        '/* generated */\n.button {}',
      )

      const result = patchFiles(
        [
          {
            outputFile: 'updated.css',
            content: '/* generated */',
            kind: 'css',
          },
          {
            outputFile: 'skipped.css',
            content: '/* generated */',
            kind: 'css',
          },
          {
            outputFile: 'missing.css',
            content: '/* generated */',
            kind: 'css',
          },
        ],
        tempDir,
      )

      expect(result).toEqual({
        written: [{ kind: 'css', outputFile: 'updated.css' }],
        skipped: [
          { kind: 'css', outputFile: 'skipped.css' },
          { kind: 'css', outputFile: 'missing.css' },
        ],
      })
    })
  })
})