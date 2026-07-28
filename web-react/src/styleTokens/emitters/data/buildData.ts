import resolveProcessedGroups from '../../compiler/resolvers/resolveProcessedGroups.ts'
import type { CompilerRun } from '../../compiler/state/compilerRun.ts'
import type { TokenCache } from '../../compiler/state/tokenCache.ts'
import extractPresetData, { type PresetFileData } from './extractors/extractPresetData.ts'
import extractTokenData, { type TokenGroupFileData } from './extractors/extractTokenData.ts'


export type EmitData = {
  presetFiles: PresetFileData[]
  tokenFiles: TokenGroupFileData[]
}
export default function buildData(
  cache: TokenCache,
  run: CompilerRun,
  //tracker!?
): EmitData {

  const presetFiles: PresetFileData[] = []
  const tokenFiles: TokenGroupFileData[] = []

  /*---------------------------------------
          NON-Group specific
  -------------------------------------*/

  const groups = resolveProcessedGroups(cache, run)

  for (const group of groups) {
    /*---------------------------------------
          NON-Css Data
    -------------------------------------*/

    const tokenResult = extractTokenData(group)
    if (tokenResult) tokenFiles.push(tokenResult)


    const cssData = run.getCssData(group.groupPath)
    if (!cssData) {
      //this should NOT throw... //TODO register event for diagnostics!?
      continue;
    }

    /*---------------------------------------
      Css Data dependencies
    -------------------------------------*/

    const presetResult = extractPresetData(cssData)
    if (presetResult) presetFiles.push(presetResult)


  }

  return {
    presetFiles,
    tokenFiles
  }
}