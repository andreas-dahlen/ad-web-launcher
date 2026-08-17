import type { TokenCache } from '../../compiler/tracking/tokenCache.ts'
import type { PresetFileData } from './assemblers/assemblePresetData.ts'
import type { TokenGroupData } from './assemblers/assembleTokenData.ts'
import { assembleTokenData } from './assemblers/assembleTokenData.ts'
import { assemblePresetData } from './assemblers/assemblePresetData.ts'
import { assembleLspData, type LspData } from './assemblers/assembleLspData.ts'
import { assembleMetadata, type GroupMetadata } from './assemblers/assembleMetadata.ts'
import { assembleExtensionData, type ExtensionData } from './assemblers/assembleExtensionData.ts'
import type { ExtractResult } from '../../types/compiler.types.ts'
import { assert } from '../../compiler/processing/assertions.ts'


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

export function extractData(
  cache: TokenCache,
): ExtractData {

  const presetFiles: PresetFileData[] = []
  const tokenData: TokenGroupData[] = []
  const metadata: GroupMetadata[] = []

  const omittedPresetFiles = new Set<string>()

  /*---------------------------------------
          NON-Group specific
  -------------------------------------*/
  const groups = cache.getGroups()


  for (const group of groups) {
    /*---------------------------------------
          NON-Css Data
    -------------------------------------*/
    assert.hasCssPath(group)

    const metaResult = assembleMetadata(group)
    if (metaResult) metadata.push(metaResult)

    const tokenResult = assembleTokenData(group)
    if (tokenResult) tokenData.push(tokenResult)

    /*---------------------------------------
      Css Data dependencies
    -------------------------------------*/
    assert.hasCssData(group)

    const presetResult = assemblePresetData(group.cssData)
    if (presetResult) { presetFiles.push(presetResult) }
    else { omittedPresetFiles.add(group.cssPath) }
  }
  /*---------------------------------------
    FInal processing
  -------------------------------------*/

  const postData = cache.getAllPostData()
  const extensionData = assembleExtensionData(
    postData.flatMap(t => t.variables),
    tokenData.flatMap(t => t.tokens)
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