
import type { EmitResult } from '../types/compiler.types.js';
import type { TokenCache } from '../compiler/tracking/tokenCache.js';
import { extractData } from './extract/extractData.js';
import { generateOutput } from './generate/generateOutput.js';
import { writeFiles } from './write/writeFiles.js';
import { patchFiles } from './write/patchFiles.js';
import type { CompilerRun } from '../compiler/tracking/compilerRun.js';

export function emitFiles(cache: TokenCache, run: CompilerRun): EmitResult {

  const { extractResult, outputData } = extractData(cache, run)

  const { files, patches } = generateOutput(outputData)

  const patchResult = patchFiles(patches)

  const writeResult = writeFiles(files)

  return {
    extractResult,
    writeResult,
    patchResult
  }
}