import { describe, expect, it, vi } from 'vitest'

import { extractData } from '@styleTokens/emitters/extract/extractData'
import { assembleMetadata, type GroupMetadata } from '@styleTokens/emitters/extract/assemblers/assembleMetadata'
import { assembleTokenData, type TokenGroupFileData } from '@styleTokens/emitters/extract/assemblers/assembleTokenData'
import { assemblePresetData } from '@styleTokens/emitters/extract/assemblers/assemblePresetData'
import { assembleVariableData } from '@styleTokens/emitters/extract/assemblers/assembleVariableData'
import type { CssVarString } from '@shared/tokenUtils/compiler.types'

vi.mock(
  '@styleTokens/emitters/extract/assemblers/assembleMetadata',
)

vi.mock(
  '@styleTokens/emitters/extract/assemblers/assembleTokenData',
)

vi.mock(
  '@styleTokens/emitters/extract/assemblers/assemblePresetData',
)

vi.mock(
  '@styleTokens/emitters/extract/assemblers/assembleVariableData',
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
        getAllPostData: vi.fn()
          .mockReturnValue([]),
      }

      vi.mocked(assembleVariableData)
        .mockReturnValue([])

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          presetFiles: [],
          tokenFiles: [],
          metadata: [],
          allVariables: [],
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
        tokens: [],
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
        getAllPostData: vi.fn()
          .mockReturnValue([]),
      }

      vi.mocked(assembleMetadata)
        .mockReturnValue(metadata as never)

      vi.mocked(assembleTokenData)
        .mockReturnValue(tokenData as never)

      vi.mocked(assemblePresetData)
        .mockReturnValue(presetData as never)

      vi.mocked(assembleVariableData)
        .mockReturnValue([])

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          metadata: [metadata],
          tokenFiles: [tokenData],
          presetFiles: [presetData],
          allVariables: [],
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
        tokens: [],
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
        getAllPostData: vi.fn()
          .mockReturnValue([]),
      }

      vi.mocked(assembleMetadata)
        .mockReturnValue(metadata as never)

      vi.mocked(assembleTokenData)
        .mockReturnValue(tokenData as never)

      vi.mocked(assemblePresetData)
        .mockReturnValue(null)

      vi.mocked(assembleVariableData)
        .mockReturnValue([])

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          metadata: [metadata],
          tokenFiles: [tokenData],
          presetFiles: [],
          allVariables: [],
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

      const metadata = {
        name: 'button',
      }

      const tokenData = {
        name: 'button',
        tokens: [],
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
        getAllPostData: vi.fn()
          .mockReturnValue([]),
      }

      vi.mocked(assembleMetadata)
        .mockReturnValue(metadata as never)

      vi.mocked(assembleTokenData)
        .mockReturnValue(tokenData as never)

      vi.mocked(assembleVariableData)
        .mockReturnValue([])

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          metadata: [metadata],
          tokenFiles: [tokenData],
          presetFiles: [],
          allVariables: [],
        },
        extractResult: {
          omittedPresetFiles: [],
        },
      })

      expect(assemblePresetData)
        .not.toHaveBeenCalled()
    })

    it('collects assembled variable data', () => {
      const group = {
        groupPath: '/tokens/button',
      }

      const postData = [
        {
          groupPath: '/tokens/button',
        },
      ]

      const tokenData = {
        name: 'button',
        tokens: [
          {
            infix: 'button',
            variables: [],
          },
        ],
      }

      const variables = [
        '--button-color',
        '--button-radius',
      ] as CssVarString[]

      const cache = {
        getGroupByGroupPath: vi.fn()
          .mockReturnValue(group),
      }

      const run = {
        getProcessedGroupPaths: vi.fn()
          .mockReturnValue(['/tokens/button']),
        getCssData: vi.fn()
          .mockReturnValue(undefined),
        getAllPostData: vi.fn()
          .mockReturnValue(postData),
      }

      vi.mocked(assembleTokenData)
        .mockReturnValue(tokenData as never)

      vi.mocked(assembleVariableData)
        .mockReturnValue(variables)

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result.outputData.allVariables)
        .toEqual(variables)

      expect(assembleVariableData)
        .toHaveBeenCalledWith(
          postData,
          tokenData.tokens,
        )
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
        getAllPostData: vi.fn()
          .mockReturnValue([]),
      }

      vi.mocked(assembleMetadata)
        .mockReturnValue(undefined as unknown as GroupMetadata)

      vi.mocked(assembleTokenData)
        .mockReturnValue(undefined as unknown as TokenGroupFileData)

      vi.mocked(assembleVariableData)
        .mockReturnValue([])

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          presetFiles: [],
          tokenFiles: [],
          metadata: [],
          allVariables: [],
        },
        extractResult: {
          omittedPresetFiles: [],
        },
      })
    })
  })
})