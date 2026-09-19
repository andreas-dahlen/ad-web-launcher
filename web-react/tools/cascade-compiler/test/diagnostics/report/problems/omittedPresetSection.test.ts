import { describe, expect, it, vi } from 'vitest'

import { omittedPresetSection } from '../../../../src/diagnostics/report/sections/problems/omittedPresetSection.ts'

vi.mock('../../../../../utils/string', () => ({
  colors: {
    subHeading: 'subHeading',
    value: 'value',
    muted: 'muted',
    file: 'file',
    heading: 'heading',
  },

  paint: String,
  formatLogPath: (value: string) => value,
}))

describe('[DIAGNOSTICS]', () => {
  describe('omittedPresetSection', () => {
    it('creates a section for omitted preset files', () => {
      const result = omittedPresetSection([
        '/components/Button/Button.module.css',
      ])

      expect(result).toBeDefined()
      expect(result?.title).toContain('Omitted Preset Files')
      expect(result?.title).toContain('1')
      expect(result?.entries).toHaveLength(1)
    })

    it('creates a line for each omitted file', () => {
      const result = omittedPresetSection([
        '/components/Button/Button.module.css',
        '/components/Card/Card.module.css',
      ])

      const lines = result?.entries[0].lines ?? []

      expect(lines).toHaveLength(2)
      expect(lines[0]).toContain('Button/Button.module.css')
      expect(lines[1]).toContain('Card/Card.module.css')
    })

    it('reports the number of omitted files in the section title', () => {
      const result = omittedPresetSection([
        '/components/Button/Button.module.css',
        '/components/Card/Card.module.css',
      ])

      expect(result?.title).toContain('2')
    })

    it('returns undefined for empty input', () => {
      expect(omittedPresetSection([])).toBeUndefined()
    })
  })
})