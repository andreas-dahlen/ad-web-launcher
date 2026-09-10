import path from 'node:path';
import type { CssVarString } from '../../../oldSharedUtils/oldSharedCompiler.types.ts';
import Color from 'colorjs.io';
import type { LspData, TokenData } from '../../../types/emitter.types.ts';

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

  const outputFile = path.join(outPath, "metadata/lsp.ts")

  return {
    rgbVariables: [...rgbVariables],
    tokens,
    outputFile
  }
}



