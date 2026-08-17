import Color from 'colorjs.io';

export type LspData = {
  rgbVariables: string[]
}

export function assembleLspData(oklchVariables: Array<[`--${string}`, string]>): LspData {

  const rgbVariables = new Set<string>()

  for (const [variable, value] of oklchVariables) {

    const color = Color.try(value)
    if (!color) continue
    const rgb = color.to('srgb')
    rgbVariables.add(`${variable}: ${rgb.toString()}`)
  }

  return {
    rgbVariables: [...rgbVariables]
  }
}



