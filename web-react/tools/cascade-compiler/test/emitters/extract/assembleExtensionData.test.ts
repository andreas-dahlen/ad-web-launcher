import { describe, expect, it } from 'vitest'

import type { CssVarString, ValidPrefix } from '../../../src/types/cascade.types.ts'
import type { PostData } from '../../../src/types/compiler.types.ts'
import type { TokenData, TokenGroupData } from '../../../src/types/emitter.types.ts'
import { assembleExtensionData } from '../../../src/emitters/extract/assemblers/assembleExtensionData.ts'

function createToken(
  overrides: Partial<TokenData> = {},
): TokenData {
  return {
    infix: 'button',
    variables: [
      {
        cssName: 'test-color',
        key: 'color',
        allowed: ['o', 's'] as ValidPrefix[],
        values: {},
      },
    ],
    ...overrides,
  }
}

function createPostData(
  overrides: Partial<PostData> = {},
): PostData {
  return {
    cssPath: 'button.css',
    variables: [
      '--existing-color',
      '--existing-radius',
    ] as CssVarString[],
    ...overrides,
  } as PostData
}

function createTokenGroup(
  overrides: Partial<TokenGroupData> = {},
): TokenGroupData {
  return {
    cssPath: 'button.css',
    tokens: [createToken()],
    ...overrides,
  } as TokenGroupData
}

describe('[EMITTERS]', () => {
  describe('assembleExtensionData', () => {
    it('preserves existing variables', () => {
      const result = assembleExtensionData(
        [createPostData()],
        [],
      )

      expect(result).toEqual([
        {
          cssPath: 'button.css',
          variables: [
            '--existing-color',
            '--existing-radius',
          ],
        },
      ])
    })

    it('adds the final variable for each token variable', () => {
      const result = assembleExtensionData(
        [],
        [createTokenGroup()],
      )

      expect(result).toEqual([
        {
          cssPath: 'button.css',
          variables: [
            '--final-button-test-color',
            '--o-button-test-color',
            '--s-button-test-color',
          ],
        },
      ])
    })

    it('adds variables for every allowed prefix', () => {
      const result = assembleExtensionData(
        [],
        [createTokenGroup()],
      )

      expect(result[0].variables).toEqual([
        '--final-button-test-color',
        '--o-button-test-color',
        '--s-button-test-color',
      ])
    })

    it('assembles variables from multiple tokens', () => {
      const result = assembleExtensionData(
        [],
        [
          createTokenGroup({
            tokens: [
              createToken({
                infix: 'button',
                variables: [
                  {
                    cssName: 'test-color',
                    key: 'color',
                    allowed: ['o'] as ValidPrefix[],
                    values: {},
                  },
                ],
              }),
              createToken({
                infix: 'button_hover',
                variables: [
                  {
                    cssName: 'test-color',
                    key: 'color',
                    allowed: ['s'] as ValidPrefix[],
                    values: {},
                  },
                ],
              }),
            ],
          }),
        ],
      )

      expect(result[0].variables).toEqual([
        '--final-button-test-color',
        '--o-button-test-color',
        '--final-button_hover-test-color',
        '--s-button_hover-test-color',
      ])
    })

    it('deduplicates existing and generated variables', () => {
      const result = assembleExtensionData(
        [
          createPostData({
            variables: [
              '--final-button-test-color',
              '--existing-color',
            ] as CssVarString[],
          }),
        ],
        [createTokenGroup()],
      )

      expect(result[0].variables).toEqual([
        '--final-button-test-color',
        '--existing-color',
        '--o-button-test-color',
        '--s-button-test-color',
      ])
    })

    it('does not add prefix variants when none are allowed', () => {
      const result = assembleExtensionData(
        [],
        [
          createTokenGroup({
            tokens: [
              createToken({
                variables: [
                  {
                    cssName: 'test-color',
                    key: 'color',
                    allowed: [],
                    values: {},
                  },
                ],
              }),
            ],
          }),
        ],
      )

      expect(result[0].variables).toEqual([
        '--final-button-test-color',
      ])
    })

    it('returns an empty collection when there are no variables', () => {
      const result = assembleExtensionData([], [])

      expect(result).toEqual([])
    })

    it('merges variables belonging to the same css file', () => {
      const result = assembleExtensionData(
        [
          createPostData({
            variables: ['--existing-color'] as CssVarString[],
          }),
        ],
        [
          createTokenGroup({
            tokens: [createToken()],
          }),
        ],
      )

      expect(result).toEqual([
        {
          cssPath: 'button.css',
          variables: [
            '--existing-color',
            '--final-button-test-color',
            '--o-button-test-color',
            '--s-button-test-color',
          ],
        },
      ])
    })

    it('keeps variables for different css files separate', () => {
      const result = assembleExtensionData(
        [
          createPostData({
            cssPath: 'button.css',
          }),
          createPostData({
            cssPath: 'label.css',
            variables: ['--label-color'] as CssVarString[],
          }),
        ],
        [],
      )

      expect(result).toEqual([
        {
          cssPath: 'button.css',
          variables: [
            '--existing-color',
            '--existing-radius',
          ],
        },
        {
          cssPath: 'label.css',
          variables: [
            '--label-color',
          ],
        },
      ])
    })
  })
})