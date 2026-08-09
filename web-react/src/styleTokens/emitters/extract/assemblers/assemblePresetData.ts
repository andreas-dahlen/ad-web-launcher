import path from "node:path"
import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.ts';
import { toCamelCase, toPascalCase } from '../../../../shared/tokenUtils/stringFormaters.ts';
import type { CssData } from '../../../types/compiler.types.ts';

const NON_PRESET_SUFFIX = 'Util'
export type PresetFileData = {
  presetName: string
  typeName: string
  cssImport: string
  presetFile: string
  selectors: string[];
};

export function assemblePresetData(
  cssData: CssData,
): PresetFileData | null {

  const name = extractGroupName(cssData.groupPath)

  const camelName = toCamelCase(name)

  const presetName = `${camelName}Preset`
  const typeName = `${toPascalCase(name)}Preset`

  const generatedDir = path.resolve("./src/shared/generated/presets");
  const presetFile = path.join(generatedDir, `${camelName}.preset.ts`);

  let cssImport = path.relative(
    generatedDir,
    cssData.cssPath
  );

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
    presetFile
  }
}