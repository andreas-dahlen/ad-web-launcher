import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { writeFiles } from '../../src/emitters/write/writeFiles.ts'

describe('[EMITTER]', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(
      path.join(os.tmpdir(), 'style-tokens-write-'),
    )
  })

  afterEach(() => {
    fs.rmSync(tempDir, {
      recursive: true,
      force: true,
    })
  })

  describe('writeFiles', () => {
    it('writes a new file', () => {
      const filePath = path.join(tempDir, 'button.ts')

      const result = writeFiles(
        [
          {
            outputFile: 'button.ts',
            content: 'export const button = {}',
            kind: 'tokens',
          },
        ],
        tempDir,
      )

      expect(result).toEqual({
        written: [{ kind: 'tokens', outputFile: 'button.ts' }],
        skipped: [],
      })

      expect(fs.readFileSync(filePath, 'utf8')).toBe(
        'export const button = {}',
      )
    })

    it('creates missing parent directories', () => {
      const filePath = path.join(
        tempDir,
        'generated',
        'tokens',
        'button.ts',
      )

      const result = writeFiles(
        [
          {
            outputFile: 'generated/tokens/button.ts',
            content: 'generated',
            kind: 'tokens',
          },
        ],
        tempDir,
      )

      expect(result).toEqual({
        written: [
          {
            kind: 'tokens',
            outputFile: 'generated/tokens/button.ts',
          },
        ],
        skipped: [],
      })

      expect(fs.readFileSync(filePath, 'utf8')).toBe(
        'generated',
      )
    })

    it('skips an existing file with identical content', () => {
      const filePath = path.join(tempDir, 'button.ts')

      const content = 'export const button = {}'

      fs.writeFileSync(filePath, content)

      const result = writeFiles(
        [
          {
            outputFile: 'button.ts',
            content,
            kind: 'tokens',
          },
        ],
        tempDir,
      )

      expect(result).toEqual({
        written: [],
        skipped: [{ kind: 'tokens', outputFile: 'button.ts' }],
      })

      expect(fs.readFileSync(filePath, 'utf8')).toBe(content)
    })

    it('updates an existing file when content differs', () => {
      const filePath = path.join(tempDir, 'button.ts')

      fs.writeFileSync(
        filePath,
        'export const button = "old"',
      )

      const result = writeFiles(
        [
          {
            outputFile: 'button.ts',
            content: 'export const button = "new"',
            kind: 'tokens',
          },
        ],
        tempDir,
      )

      expect(result).toEqual({
        written: [{ kind: 'tokens', outputFile: 'button.ts' }],
        skipped: [],
      })

      expect(fs.readFileSync(filePath, 'utf8')).toBe(
        'export const button = "new"',
      )
    })

    it('processes multiple files independently', () => {
      const newPath = path.join(tempDir, 'new.ts')
      const skippedPath = path.join(tempDir, 'skipped.ts')
      const updatedPath = path.join(tempDir, 'updated.ts')

      fs.writeFileSync(
        skippedPath,
        'same',
      )

      fs.writeFileSync(
        updatedPath,
        'old',
      )

      const result = writeFiles(
        [
          {
            outputFile: 'new.ts',
            content: 'new',
            kind: 'tokens',
          },
          {
            outputFile: 'skipped.ts',
            content: 'same',
            kind: 'tokens',
          },
          {
            outputFile: 'updated.ts',
            content: 'new',
            kind: 'tokens',
          },
        ],
        tempDir,
      )

      expect(result).toEqual({
        written: [
          { kind: 'tokens', outputFile: 'new.ts' },
          { kind: 'tokens', outputFile: 'updated.ts' },
        ],
        skipped: [
          { kind: 'tokens', outputFile: 'skipped.ts' },
        ],
      })

      expect(fs.readFileSync(newPath, 'utf8')).toBe('new')
      expect(fs.readFileSync(skippedPath, 'utf8')).toBe('same')
      expect(fs.readFileSync(updatedPath, 'utf8')).toBe('new')
    })
  })
})