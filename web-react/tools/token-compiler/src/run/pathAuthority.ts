import path from 'node:path';
import type { CompilerConfig, UserOverrides } from './run.js';
import { loadCompilerConfig } from './loadCompilerConfig.js';


export function handlePathAuthority(rootDir: string, overrides: UserOverrides): CompilerConfig {

  const cliDirectory = path.dirname(process.argv[1])
  const compilerDirectory = path.dirname(cliDirectory)
  const projectRoot = path.resolve(
    compilerDirectory,
    rootDir,
  )

  const config = loadCompilerConfig(projectRoot)

  const tokenRaw = config.tokenFolder ?? overrides.tokenFolder ?? 'src/styleTokens/tokens'
  const outRaw = config.outDir ?? overrides.outDir ?? 'src/styleTokens/generated'

  const tokenPath = path.resolve(projectRoot, tokenRaw)
  const outPath = path.resolve(projectRoot, outRaw)

  return {
    rootDir: projectRoot,
    tokenPath,
    outPath
  }
}