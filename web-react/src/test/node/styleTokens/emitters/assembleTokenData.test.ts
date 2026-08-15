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

      const variables = [] as CssVarString[]

      vi.mocked(assembleVariableData)
        .mockReturnValue(variables)

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          presetFiles: [],
          tokenFiles: [],
          metadata: [],
          allVariables: variables,
        },
        extractResult: {
          omittedPresetFiles: [],
        },
      })

      expect(run.getAllPostData)
        .toHaveBeenCalled()

      expect(assembleVariableData)
        .toHaveBeenCalledWith([], [])
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

      const variables = [] as CssVarString[]

      vi.mocked(assembleMetadata)
        .mockReturnValue(metadata as never)

      vi.mocked(assembleTokenData)
        .mockReturnValue(tokenData as never)

      vi.mocked(assemblePresetData)
        .mockReturnValue(presetData as never)

      vi.mocked(assembleVariableData)
        .mockReturnValue(variables)

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          metadata: [metadata],
          tokenFiles: [tokenData],
          presetFiles: [presetData],
          allVariables: variables,
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

      const variables = [] as CssVarString[]

      vi.mocked(assembleMetadata)
        .mockReturnValue(metadata as never)

      vi.mocked(assembleTokenData)
        .mockReturnValue(tokenData as never)

      vi.mocked(assemblePresetData)
        .mockReturnValue(null)

      vi.mocked(assembleVariableData)
        .mockReturnValue(variables)

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          metadata: [metadata],
          tokenFiles: [tokenData],
          presetFiles: [],
          allVariables: variables,
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

      const variables = [] as CssVarString[]

      vi.mocked(assembleMetadata)
        .mockReturnValue(metadata as never)

      vi.mocked(assembleTokenData)
        .mockReturnValue(tokenData as never)

      vi.mocked(assembleVariableData)
        .mockReturnValue(variables)

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          metadata: [metadata],
          tokenFiles: [tokenData],
          presetFiles: [],
          allVariables: variables,
        },
        extractResult: {
          omittedPresetFiles: [],
        },
      })

      expect(assemblePresetData)
        .not.toHaveBeenCalled()
    })

    it('collects assembled variable data from all token files', () => {
      const groups = [
        {
          groupPath: '/tokens/button',
        },
        {
          groupPath: '/tokens/input',
        },
      ]

      const postData = [
        {
          groupPath: '/tokens/button',
        },
        {
          groupPath: '/tokens/input',
        },
      ]

      const buttonTokenData = {
        name: 'button',
        tokens: [
          {
            infix: 'button',
            variables: [],
          },
        ],
      }

      const inputTokenData = {
        name: 'input',
        tokens: [
          {
            infix: 'input',
            variables: [],
          },
        ],
      }

      const variables = [
        '--button-color',
        '--button-radius',
        '--input-color',
      ] as CssVarString[]

      const cache = {
        getGroupByGroupPath: vi.fn()
          .mockImplementation(groupPath => {
            return groups.find(group => group.groupPath === groupPath)
          }),
      }

      const run = {
        getProcessedGroupPaths: vi.fn()
          .mockReturnValue([
            '/tokens/button',
            '/tokens/input',
          ]),
        getCssData: vi.fn()
          .mockReturnValue(undefined),
        getAllPostData: vi.fn()
          .mockReturnValue(postData),
      }

      vi.mocked(assembleTokenData)
        .mockReturnValueOnce(buttonTokenData as never)
        .mockReturnValueOnce(inputTokenData as never)

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
          [
            ...buttonTokenData.tokens,
            ...inputTokenData.tokens,
          ],
        )
    })

    it('only passes successfully assembled token data to variable assembly', () => {
      const groups = [
        {
          groupPath: '/tokens/button',
        },
        {
          groupPath: '/tokens/input',
        },
      ]

      const postData = [
        {
          groupPath: '/tokens/button',
        },
        {
          groupPath: '/tokens/input',
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

      const cache = {
        getGroupByGroupPath: vi.fn()
          .mockImplementation(groupPath => {
            return groups.find(group => group.groupPath === groupPath)
          }),
      }

      const run = {
        getProcessedGroupPaths: vi.fn()
          .mockReturnValue([
            '/tokens/button',
            '/tokens/input',
          ]),
        getCssData: vi.fn()
          .mockReturnValue(undefined),
        getAllPostData: vi.fn()
          .mockReturnValue(postData),
      }

      const variables = [] as CssVarString[]

      vi.mocked(assembleTokenData)
        .mockReturnValueOnce(tokenData as never)
        .mockReturnValueOnce(undefined as unknown as TokenGroupFileData)

      vi.mocked(assembleVariableData)
        .mockReturnValue(variables)

      extractData(
        cache as never,
        run as never,
      )

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

      const variables = [] as CssVarString[]

      vi.mocked(assembleMetadata)
        .mockReturnValue(undefined as unknown as GroupMetadata)

      vi.mocked(assembleTokenData)
        .mockReturnValue(undefined as unknown as TokenGroupFileData)

      vi.mocked(assembleVariableData)
        .mockReturnValue(variables)

      const result = extractData(
        cache as never,
        run as never,
      )

      expect(result).toEqual({
        outputData: {
          presetFiles: [],
          tokenFiles: [],
          metadata: [],
          allVariables: variables,
        },
        extractResult: {
          omittedPresetFiles: [],
        },
      })
    })
  })
})