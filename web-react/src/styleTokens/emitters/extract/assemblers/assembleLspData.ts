import type { CssVarString } from '../../../../shared/tokenUtils/compiler.types.ts';
import type { TokenData } from './assembleTokenData.ts';
import Color from 'colorjs.io';

export type LspData = {
  rgbVariables: string[]
  tokens: TokenData[]
}

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

  return {
    rgbVariables: [...rgbVariables],
    tokens
  }
}



