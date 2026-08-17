
import type { EmitResult } from '../types/compiler.types.ts';
import type { TokenCache } from '../compiler/tracking/tokenCache.ts';
import { extractData } from './extract/extractData.ts';
import { generateOutput } from './generate/generateOutput.ts';
import { writeFiles } from './write/writeFiles.ts';
import { patchFiles } from './write/patchFiles.ts';
import type { CompilerRun } from '../compiler/tracking/compilerRun.ts';

export function emitFiles(cache: TokenCache, run: CompilerRun): EmitResult {
  const groups = cache.getCssDataGroups()
  const runGroups = cache.getCssDataGroupsByPaths(
    run.getProcessedPaths()
  )

  const { extractResult, outputData } = extractData({
    groups,
    postData: cache.getAllPostData(),
    runGroups
  })

  const { files, patches } = generateOutput(outputData)

  const patchResult = patchFiles(patches)

  const writeResult = writeFiles(files)

  return {
    extractResult,
    writeResult,
    patchResult
  }
}