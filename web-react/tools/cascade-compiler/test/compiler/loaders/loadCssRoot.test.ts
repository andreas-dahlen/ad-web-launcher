import { describe, expect, it, vi } from 'vitest'

import { loadCssRoot } from '../../../src/compiler/loaders/loadCssRoot.ts'

const readFileSyncMock = vi.hoisted(() => vi.fn())

vi.mock('node:fs', () => ({
  readFileSync: readFileSyncMock,
}))

describe('[COMPILER > PROCESSING]', () => {
  describe('loadCssRoot', () => {
    it('parses the provided CSS source', () => {
      const root = loadCssRoot(
        '/project/styles.module.css',
        '.button { color: red; }',
      )

      expect(root.toString()).toBe('.button { color: red; }')
      expect(readFileSyncMock).not.toHaveBeenCalled()
    })

    it('reads and parses the CSS file when no source is provided', () => {
      readFileSyncMock.mockReturnValue('.button { color: blue; }')

      const root = loadCssRoot('/project/styles.module.css')

      expect(readFileSyncMock).toHaveBeenCalledWith(
        '/project/styles.module.css',
        'utf8',
      )
      expect(root.toString()).toBe('.button { color: blue; }')
    })
  })
})