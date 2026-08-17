import type { PresetFileData } from './assemblers/assemblePresetData.ts'
import type { TokenGroupData } from './assemblers/assembleTokenData.ts'
import { assembleTokenData } from './assemblers/assembleTokenData.ts'
import { assemblePresetData } from './assemblers/assemblePresetData.ts'
import { assembleLspData, type LspData } from './assemblers/assembleLspData.ts'
import { assembleMetadata, type GroupMetadata } from './assemblers/assembleMetadata.ts'
import { assembleExtensionData, type ExtensionData } from './assemblers/assembleExtensionData.ts'
import type { CssDataTokenGroup, ExtractResult } from '../../types/compiler.types.ts'
import type { PostData } from '@styleTokens/postCss/processPost.ts'


export type EmitData = {
  presetFiles: PresetFileData[]
  tokenData: TokenGroupData[]
  metadata: GroupMetadata[]
  extensionData: ExtensionData
  lspData: LspData
}

export type ExtractData = {
  outputData: EmitData
  extractResult: ExtractResult
}

export function extractData({
  groups,
  postData,
  runGroups
}: {
  groups: CssDataTokenGroup[],
  postData: PostData[],
  runGroups: CssDataTokenGroup[]
}): ExtractData {

  const presetFiles: PresetFileData[] = []
  const tokenData: TokenGroupData[] = []
  const metadata: GroupMetadata[] = []

  const omittedPresetFiles = new Set<string>()

  /*---------------------------------------
          Multiple files run results
  -------------------------------------*/

  for (const runGroup of runGroups) {
    const tokenResult = assembleTokenData(runGroup)
    if (tokenResult) tokenData.push(tokenResult)

    const presetResult = assemblePresetData(runGroup.cssData)
    if (presetResult) { presetFiles.push(presetResult) }
    else { omittedPresetFiles.add(runGroup.cssPath) }

  }


  /*---------------------------------------
        Single file output
  -------------------------------------*/
  for (const group of groups) {

    const metaResult = assembleMetadata(group)
    if (metaResult) metadata.push(metaResult)

  }
  /*---------------------------------------
    Final processing
  -------------------------------------*/

  const allTokenData = groups
    .map(assembleTokenData)
    .filter((data): data is TokenGroupData => data !== undefined)

  const extensionData = assembleExtensionData(
    postData.flatMap(t => t.variables),
    allTokenData.flatMap(t => t.tokens)
  )

  const lspData = assembleLspData(postData.flatMap(t => t.oklchVariables))

  return {
    outputData: {
      presetFiles,
      tokenData,
      metadata,
      extensionData,
      lspData
    },
    extractResult: {
      omittedPresetFiles: [...omittedPresetFiles]
    }
  }
}