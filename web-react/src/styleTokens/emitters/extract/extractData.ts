import type { PresetFileData } from './assemblers/assemblePresetData.ts'
import type { TokenGroupData } from './assemblers/assembleTokenData.ts'
import { assembleTokenData } from './assemblers/assembleTokenData.ts'
import { assemblePresetData } from './assemblers/assemblePresetData.ts'
import { assembleLspData, type LspData } from './assemblers/assembleLspData.ts'
import { assembleMetadata, type GroupMetadata } from './assemblers/assembleMetadata.ts'
import { assembleExtensionData, type ExtensionData } from './assemblers/assembleExtensionData.ts'
import type { ExtractResult } from '../../types/compiler.types.ts'
import type { TokenCache } from '../../compiler/tracking/tokenCache.ts'
import type { CompilerRun } from '../../compiler/tracking/compilerRun.ts'


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

  /*---------------------------------------
        all groups
  -------------------------------------*/
  for (const group of groups) {

    const tokenResult = assembleTokenData(group)
    if (tokenResult) tokenData.push(tokenResult)

    const metaResult = assembleMetadata(group)
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

    const presetResult = assemblePresetData(runGroup.cssData)
    if (presetResult) { presetFiles.push(presetResult) }
    else { omittedPresetFiles.add(runGroup.cssPath) }
  }


  /*---------------------------------------
    Final processing
  -------------------------------------*/

  const extensionData = assembleExtensionData(
    postData.flatMap(t => t.variables),
    tokenData.flatMap(t => t.tokens)
  )

  const lspData = assembleLspData(
    postData.flatMap(t => t.oklchVariables),
    tokenData.flatMap(t => t.tokens)
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