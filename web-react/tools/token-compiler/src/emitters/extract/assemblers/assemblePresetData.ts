import path from "node:path"
import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.ts';
import { toCamelCase, toPascalCase } from '../../../oldSharedUtils/stringFormaters.ts';
import type { CssData } from '../../../types/compiler.types.ts';

const NON_PRESET_SUFFIX = 'Util'
export type PresetFileData = {
  presetName: string
  typeName: string
  cssImport: string
  selectors: string[];
  outputFile: string
};

export function assemblePresetData(
  cssData: CssData,
  outDir: string
): PresetFileData | null {

  const name = extractGroupName(cssData.groupPath)

  const camelName = toCamelCase(name)
  const outputFile = path.join(outDir, `presets/${camelName}.preset.ts`)

  const presetName = `${camelName}Preset`
  const typeName = `${toPascalCase(name)}Preset`

  const generatedDir = path.join(outDir, "presets")

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