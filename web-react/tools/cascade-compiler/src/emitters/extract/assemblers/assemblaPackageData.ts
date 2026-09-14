import type { PackageData, PresetFileData, TokenGroupData } from '../../../types/emitter.types.ts';


export function assemblePackageData(tokenFiles: TokenGroupData[], presetFiles: PresetFileData[]): PackageData {

  const fileNames: string[] = Array.from(tokenFiles, file => file.outputFile);

  for (const file of presetFiles) {
    fileNames.push(file.outputFile)
  }
  return {
    fileNames,
    outputFile: "index.ts"
  }
}