import { describe, expect, it, vi } from 'vitest'

import { extractData } from '@styleTokens/emitters/extract/extractData'
import { assembleMetadata, type GroupMetadata } from '@styleTokens/emitters/extract/assemblers/assembleMetadata'
import { assembleTokenData, type TokenGroupFileData } from '@styleTokens/emitters/extract/assemblers/assembleTokenData'
import { assemblePresetData } from '@styleTokens/emitters/extract/assemblers/assemblePresetData'

vi.mock(
  '@styleTokens/emitters/extract/assemblers/assembleMetadata',
)

vi.mock(
  '@styleTokens/emitters/extract/assemblers/assembleTokenData',
)

vi.mock(
  '@styleTokens/emitters/extract/assemblers/assemblePresetData',
)

describe('[EMITTERS]', () => {
  describe('extractData', () => {

    it('returns empty collections when there are no processed groups', () => {
      const cache = {
        getGroupByGroupPath: vi.fn(),
      }

      const run = {
        getProcessedGroupPaths: vi.fn()
          .mockReturnValue([]),
        getCssData: vi.fn(),
      }

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          presetFiles: [],
          tokenFiles: [],
          metadata: [],
        },
        extractResult: {
          omittedPresetFiles: [],
        },
      })
    })

    it('collects assembled metadata, token data, and preset data', () => {
      const group = {
        groupPath: '/tokens/button',
      }

      const cssData = {
        groupPath: '/tokens/button',
      }

      const metadata = {
        name: 'button',
      }

      const tokenData = {
        name: 'button',
      }

      const presetData = {
        presetName: 'buttonPreset',
      }

      const cache = {
        getGroupByGroupPath: vi.fn()
          .mockReturnValue(group),
      }

      const run = {
        getProcessedGroupPaths: vi.fn()
          .mockReturnValue(['/tokens/button']),
        getCssData: vi.fn()
          .mockReturnValue(cssData),
      }

      vi.mocked(assembleMetadata)
        .mockReturnValue(metadata as never)

      vi.mocked(assembleTokenData)
        .mockReturnValue(tokenData as never)

      vi.mocked(assemblePresetData)
        .mockReturnValue(presetData as never)

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          metadata: [metadata],
          tokenFiles: [tokenData],
          presetFiles: [presetData],
        },
        extractResult: {
          omittedPresetFiles: [],
        },
      })

      expect(assembleMetadata)
        .toHaveBeenCalledWith(group)

      expect(assembleTokenData)
        .toHaveBeenCalledWith(group)

      expect(assemblePresetData)
        .toHaveBeenCalledWith(cssData)
    })

    it('records omitted preset files when preset data is not assembled', () => {
      const group = {
        groupPath: '/tokens/button',
      }

      const cssData = {
        cssPath: '/styles/button.css',
        groupPath: '/tokens/button',
      }

      const metadata = {
        name: 'button',
      }

      const tokenData = {
        name: 'button',
      }

      const cache = {
        getGroupByGroupPath: vi.fn()
          .mockReturnValue(group),
      }

      const run = {
        getProcessedGroupPaths: vi.fn()
          .mockReturnValue(['/tokens/button']),
        getCssData: vi.fn()
          .mockReturnValue(cssData),
      }

      vi.mocked(assembleMetadata)
        .mockReturnValue(metadata as never)

      vi.mocked(assembleTokenData)
        .mockReturnValue(tokenData as never)

      vi.mocked(assemblePresetData)
        .mockReturnValue(null)

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          metadata: [metadata],
          tokenFiles: [tokenData],
          presetFiles: [],
        },
        extractResult: {
          omittedPresetFiles: [
            '/styles/button.css',
          ],
        },
      })

      expect(assemblePresetData)
        .toHaveBeenCalledWith(cssData)
    })

    it('skips preset data when CSS data is missing', () => {
      const group = {
        groupPath: '/tokens/button',
      }

      const cache = {
        getGroupByGroupPath: vi.fn()
          .mockReturnValue(group),
      }

      const run = {
        getProcessedGroupPaths: vi.fn()
          .mockReturnValue(['/tokens/button']),
        getCssData: vi.fn()
          .mockReturnValue(undefined),
      }

      const metadata = {
        name: 'button',
      }

      const tokenData = {
        name: 'button',
      }

      vi.mocked(assembleMetadata)
        .mockReturnValue(metadata as never)

      vi.mocked(assembleTokenData)
        .mockReturnValue(tokenData as never)

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          metadata: [metadata],
          tokenFiles: [tokenData],
          presetFiles: [],
        },
        extractResult: {
          omittedPresetFiles: [],
        },
      })

      expect(assemblePresetData)
        .not.toHaveBeenCalled()
    })

    it('only collects assembler results that exist', () => {
      const group = {
        groupPath: '/tokens/button',
      }

      const cache = {
        getGroupByGroupPath: vi.fn()
          .mockReturnValue(group),
      }

      const run = {
        getProcessedGroupPaths: vi.fn()
          .mockReturnValue(['/tokens/button']),
        getCssData: vi.fn()
          .mockReturnValue(undefined),
      }

      vi.mocked(assembleMetadata)
        .mockReturnValue(undefined as unknown as GroupMetadata)

      vi.mocked(assembleTokenData)
        .mockReturnValue(undefined as unknown as TokenGroupFileData)

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          presetFiles: [],
          tokenFiles: [],
          metadata: [],
        },
        extractResult: {
          omittedPresetFiles: [],
        },
      })
    })
  })
})