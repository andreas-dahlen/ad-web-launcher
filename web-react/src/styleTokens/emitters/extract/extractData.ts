import type { CompilerRun } from '../../compiler/tracking/compilerRun.ts'
import type { TokenCache } from '../../compiler/tracking/tokenCache.ts'
import { resolveProcessedGroups } from '../../compiler/resolvers/resolveProcessedGroups.ts'
import type { PresetFileData } from './assemblers/assemblePresetData.ts'
import type { TokenGroupFileData } from './assemblers/assembleTokenData.ts'
import { assembleTokenData } from './assemblers/assembleTokenData.ts'
import { assemblePresetData } from './assemblers/assemblePresetData.ts'
import { assembleMetadata, type GroupMetadata } from './assemblers/assembleMetadata.ts'


export type EmitData = {
  presetFiles: PresetFileData[]
  tokenFiles: TokenGroupFileData[]
  metadata: GroupMetadata[]
}
export function extractData(
  cache: TokenCache,
  run: CompilerRun,
  //tracker!?
): EmitData {

  const presetFiles: PresetFileData[] = []
  const tokenFiles: TokenGroupFileData[] = []
  const metadata: GroupMetadata[] = []

  /*---------------------------------------
          NON-Group specific
  -------------------------------------*/

  const groups = resolveProcessedGroups(cache, run)

  for (const group of groups) {
    /*---------------------------------------
          NON-Css Data
    -------------------------------------*/

    const metaResult = assembleMetadata(group)
    if (metaResult) metadata.push(metaResult)

    const tokenResult = assembleTokenData(group)
    if (tokenResult) tokenFiles.push(tokenResult)


    const cssData = run.getCssData(group.groupPath)
    if (!cssData) {
      //this should NOT throw... //TODO register event for diagnostics!?
      continue;
    }

    /*---------------------------------------
      Css Data dependencies
    -------------------------------------*/

    const presetResult = assemblePresetData(cssData)
    if (presetResult) presetFiles.push(presetResult)


  }

  return {
    presetFiles,
    tokenFiles,
    metadata
  }
}