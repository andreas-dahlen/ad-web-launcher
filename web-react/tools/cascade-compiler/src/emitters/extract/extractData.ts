import { assembleTokenData } from './assemblers/assembleTokenData.ts'
import { assemblePresetData } from './assemblers/assemblePresetData.ts'
import { assembleLspData } from './assemblers/assembleLspData.ts'
import { assembleMetadata } from './assemblers/assembleMetadata.ts'
import { assembleExtensionData } from './assemblers/assembleExtensionData.ts'
import { assemblePackageData } from './assemblers/assemblaPackageData.ts'
import { assembleJsonSchema } from './assemblers/assembleJsonSchema.ts'
import type { TokenCache } from '../../compiler/tracking/tokenCache.ts'
import type { CompilerRun } from '../../compiler/tracking/compilerRun.ts'
import type { EmitData, ExtractResult, GroupMetadata, PresetFileData, TokenGroupData } from '../../types/emitter.types.ts'

type ExtractData = {
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
  // const config = cache.getEmitConfig()

  /*---------------------------------------
        all groups
  -------------------------------------*/
  for (const group of groups) {
    tokenData.push(assembleTokenData(group))
    metadata.push(assembleMetadata(group))
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

  const jsonSchema = assembleJsonSchema()

  const packageData = assemblePackageData(tokenFiles, presetFiles)

  return {
    outputData: {
      presetFiles,
      tokenFiles,
      metadata,
      extensionData,
      lspData,
      jsonSchema,
      packageData
    },
    extractResult: {
      omittedPresetFiles: [...omittedPresetFiles]
    }
  }
}