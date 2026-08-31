import path from 'node:path';
import type { CssVarString } from '../../../oldSharedUtils/oldSharedCompiler.types.js';
import type { TokenData } from './assembleTokenData.js';
import Color from 'colorjs.io';

export type LspData = {
  rgbVariables: string[]
  tokens: TokenData[]
  outputFile: string
}

export function assembleLspData(
  oklchVariables: Array<[CssVarString, string]>,
  tokens: TokenData[],
  outPath: string
): LspData {

  const rgbVariables = new Set<string>()

  for (const [variable, value] of oklchVariables) {

    const color = Color.try(value)
    if (!color) continue
    const rgb = color.to('srgb')
    rgbVariables.add(`${variable}: ${rgb.toString()}`)
  }

  const outputFile = path.join(outPath, "metadata/lsp.generated.ts")

  return {
    rgbVariables: [...rgbVariables],
    tokens,
    outputFile
  }
}



