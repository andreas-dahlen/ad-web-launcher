import path from 'node:path';

import { loadCompilerConfig } from './loadCompilerConfig.js';
import type { CompilerConfig, UserOptions } from '../types/run.types.js';


export function resolveConfig(rootDir: string, options: UserOptions): CompilerConfig | null {

  const cliDirectory = path.dirname(process.argv[1])
  const compilerDirectory = path.dirname(cliDirectory)
  const projectRoot = path.resolve(
    compilerDirectory,
    rootDir,
  )

  const config = loadCompilerConfig(projectRoot)

  const tokenRaw = config.tokenFolder ?? options.tokenFolder

  if (!tokenRaw) {
    throw new Error("Error: Couldn't resolve token path in either compiler.config.json or vsCode settings")
  }
  const outRaw = config.outDir ?? options.outDir

  const outPath = outRaw ? path.resolve(projectRoot, outRaw) : null

  const mute = config.mute ?? options.mute ?? false

  return {
    rootDir: projectRoot,
    tokenPath: path.resolve(projectRoot, tokenRaw),
    outPath,
    mute
  }
}