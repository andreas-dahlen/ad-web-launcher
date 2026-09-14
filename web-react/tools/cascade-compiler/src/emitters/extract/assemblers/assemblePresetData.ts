import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.ts';
import { toCamelCase, toPascalCase } from '../../../utils/stringFormaters.ts';
import type { CssData } from '../../../types/compiler.types.ts';
import type { PresetFileData } from '../../../types/emitter.types.ts';

const NON_PRESET_SUFFIX = 'Util'

export function assemblePresetData(
  cssData: CssData
): PresetFileData | null {

  const name = extractGroupName(cssData.groupPath)

  const camelName = toCamelCase(name)
  const outputFile = `presets/${camelName}.preset.ts`

  const typeName = `${toPascalCase(name)}Preset`

  const selectors = cssData.usableSelectors.filter(
    selector =>
      selector !== camelName &&
      !selector.endsWith(NON_PRESET_SUFFIX)
  )

  if (selectors.length === 0) return null

  return {
    typeName,
    selectors,
    outputFile
  }
}