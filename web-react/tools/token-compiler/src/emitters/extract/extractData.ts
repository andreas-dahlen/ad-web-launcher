import type { PresetFileData } from './assemblers/assemblePresetData.js'
import type { TokenGroupData } from './assemblers/assembleTokenData.js'
import { assembleTokenData } from './assemblers/assembleTokenData.js'
import { assemblePresetData } from './assemblers/assemblePresetData.js'
import { assembleLspData, type LspData } from './assemblers/assembleLspData.js'
import { assembleMetadata, type GroupMetadata } from './assemblers/assembleMetadata.js'
import { assembleExtensionData, type ExtensionData } from './assemblers/assembleExtensionData.js'
import type { ExtractResult } from '../../types/compiler.types.js'
import type { TokenCache } from '../../compiler/tracking/tokenCache.js'
import type { CompilerRun } from '../../compiler/tracking/compilerRun.js'


export type EmitData = {
  presetFiles: PresetFileData[]
  tokenFiles: TokenGroupData[]
  metadata: GroupMetadata[]
  extensionData: ExtensionData
  lspData: LspData
}

export type ExtractData = {
  outputData: EmitData
  extractResult: ExtractResult
}

export function extractData(cache: TokenCache,
  run: CompilerRun): ExtractData {

  const presetFiles: PresetFileData[] = []
  const tokenFiles: TokenGroupData[] = []
  const tokenData: TokenGroupData[] = []
  const metadata: GroupMetadata[] = []

  const omittedPresetFiles = new Set<string>()

  const groups = cache.getCssDataGroups()
  const runGroups = cache.getCssDataGroupsByPaths(run.getProcessedPaths())
  const postData = cache.getAllPostData()
  const config = cache.getEmitConfig()

  /*---------------------------------------
        all groups
  -------------------------------------*/
  for (const group of groups) {

    const tokenResult = assembleTokenData(group, config.outPath)
    if (tokenResult) tokenData.push(tokenResult)

    const metaResult = assembleMetadata(group, config.outPath)
    if (metaResult) metadata.push(metaResult)

  }

  /*---------------------------------------
          current run
  -------------------------------------*/
  for (const runGroup of runGroups) {
    const tokenFile = tokenData.find(
      data => data.groupPath === runGroup.groupPath,
    )
    if (tokenFile) {
      tokenFiles.push(tokenFile)
    }

    const presetResult = assemblePresetData(runGroup.cssData, config.outPath)
    if (presetResult) { presetFiles.push(presetResult) }
    else { omittedPresetFiles.add(runGroup.cssPath) }
  }


  /*---------------------------------------
    Final processing
  -------------------------------------*/

  const extensionData = assembleExtensionData(
    postData.flatMap(t => t.variables),
    tokenData.flatMap(t => t.tokens),
    config.outPath
  )

  const lspData = assembleLspData(
    postData.flatMap(t => t.oklchVariables),
    tokenData.flatMap(t => t.tokens),
    config.outPath
  )

  return {
    outputData: {
      presetFiles,
      tokenFiles,
      metadata,
      extensionData,
      lspData
    },
    extractResult: {
      omittedPresetFiles: [...omittedPresetFiles]
    }
  }
}