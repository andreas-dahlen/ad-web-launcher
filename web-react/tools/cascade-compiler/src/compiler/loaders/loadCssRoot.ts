import { readFileSync } from 'node:fs'
import postcss, { Root } from 'postcss'

export function loadCssRoot(
  cssPath: string,
  source?: string,
): Root {
  //TODO can throw... 
  source ??= readFileSync(cssPath, 'utf8')

  return postcss.parse(source, { from: cssPath })
}