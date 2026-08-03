
import type { EmitResult } from '../types/compiler.types.ts';
import type { TokenCache } from '../compiler/tracking/tokenCache.ts';
import type { CompilerRun } from '../compiler/tracking/compilerRun.ts';
import { extractData } from './extract/extractData.ts';
import { generateOutput } from './generate/generateOutput.ts';
import { writeFiles } from './write/writeFiles.ts';
import { patchFiles } from './write/patchFiles.ts';

export function emitFiles(cache: TokenCache, run: CompilerRun): EmitResult {


  const data = extractData(cache, run)

  const { files, patches } = generateOutput(data)

  const patchResult = patchFiles(patches)

  const writeResult = writeFiles(files)

  return {
    writeResult,
    patchResult
  }
}