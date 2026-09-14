import Color from 'colorjs.io';
import type { LspData, TokenData } from '../../../types/emitter.types.ts';
import type { CssVarString } from 'cascade';

export function assembleLspData(
  oklchVariables: Array<[CssVarString, string]>,
  tokens: TokenData[]
): LspData {

  const rgbVariables = new Set<string>()

  for (const [variable, value] of oklchVariables) {

    const color = Color.try(value)
    if (!color) continue
    const rgb = color.to('srgb')
    rgbVariables.add(`${variable}: ${rgb.toString()}`)
  }

  const outputFile = "metadata/lsp.ts"

  return {
    rgbVariables: [...rgbVariables],
    tokens,
    outputFile
  }
}



