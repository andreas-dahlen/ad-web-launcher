import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.ts';
import { toCamelCase, toPascalCase } from '../../../utils/stringFormaters.ts';
import type { CssData } from '../../../types/compiler.types.ts';
import type { PresetFileData } from '../../../types/emitter.types.ts';

const NON_PRESET_SUFFIX = 'Util'

export function assemblePresetData(
  cssData: CssData,
  presetIgnore: string[]
): PresetFileData | null {

  const groupName = extractGroupName(cssData.groupPath)

  const name = toCamelCase(groupName)

  const typeName = `${toPascalCase(groupName)}Preset`

  const selectors = cssData.usableSelectors.filter(
    selector =>
      selector !== name &&
      !selector.endsWith(NON_PRESET_SUFFIX) &&
      !presetIgnore.includes(selector)
  )

  if (selectors.length === 0) return null

  return {
    name,
    typeName,
    selectors
  }
}