
import type { EmitResult } from '../types/compiler.types.ts';
import type { CompilerRun } from '../compiler/state/compilerRun.ts';
import type { TokenCache } from '../compiler/state/tokenCache.ts';
import buildData from './data/buildData.ts';
import buildOutput from './format/buildOutput.ts';
import writeFiles from './write/writeFiles.ts';

export default function emitFiles(cache: TokenCache, run: CompilerRun): EmitResult {


  const data = buildData(cache, run)

  const files = buildOutput(data)

  const writeResult = writeFiles(files)

  return {
    writeResult
  }
}