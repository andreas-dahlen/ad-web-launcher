
import type { EmitResult } from '../types/emitter.types.ts';
import type { TokenCache } from '../compiler/tracking/tokenCache.ts';
import { extractData } from './extract/extractData.ts';
import { generateOutput } from './generate/generateOutput.ts';
import { writeFiles } from './write/writeFiles.ts';
import { patchFiles } from './write/patchFiles.ts';
import type { CompilerRun } from '../compiler/tracking/compilerRun.ts';

export function emitFiles(cache: TokenCache, run: CompilerRun): EmitResult {
  const config = cache.getEmitConfig()

  const { extractResult, outputData } = extractData(cache, run)

  const { files, patches } = generateOutput(outputData, config)

  const patchResult = patchFiles(patches, config.generatedPath)

  const writeResult = writeFiles(files, config.generatedPath)

  return {
    extractResult,
    patchResult,
    writeResult
  }
}