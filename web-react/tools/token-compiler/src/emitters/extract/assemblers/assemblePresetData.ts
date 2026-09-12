import path from "node:path"
import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.ts';
import { toCamelCase, toPascalCase } from '../../../oldSharedUtils/stringFormaters.ts';
import type { CssData } from '../../../types/compiler.types.ts';
import type { PresetFileData } from '../../../types/emitter.types.ts';

const NON_PRESET_SUFFIX = 'Util'

export function assemblePresetData(
  cssData: CssData,
  outPath: string
): PresetFileData | null {

  const name = extractGroupName(cssData.groupPath)

  const camelName = toCamelCase(name)
  const outputFile = path.join(outPath, `presets/${camelName}.preset.ts`)

  const presetName = `${camelName}Preset`
  const typeName = `${toPascalCase(name)}Preset`

  const generatedDir = path.join(outPath, "presets")

  let cssImport = path.relative(
    generatedDir,
    cssData.cssPath,
  )

  cssImport = cssImport.replaceAll("\\", "/")

  const selectors = cssData.usableSelectors.filter(
    selector =>
      selector !== camelName &&
      !selector.endsWith(NON_PRESET_SUFFIX)
  )

  if (selectors.length === 0) return null

  // make it valid for imports
  cssImport = cssImport.replaceAll("\\", "/");

  return {
    presetName,
    typeName,
    selectors,
    cssImport,
    outputFile
  }
}