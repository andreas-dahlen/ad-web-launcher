import path from 'node:path';

import { loadCompilerConfig } from './loadCompilerConfig.ts';
import type { CompilerConfig, CompilerInternalConfig } from '../../types/run.types.ts';

export function resolveConfig(
  projectRoot: string,
  tokenFolder?: string,
  internal?: CompilerInternalConfig
): CompilerConfig {
  const config = loadCompilerConfig(projectRoot)
  const tokenRaw = config.tokenFolder ?? tokenFolder
  if (!tokenRaw) {
    throw new Error("Error: Couldn't resolve token path in either cascade.config.json or argument")
  }

  const basePath = config.outDir ? path.resolve(projectRoot, config.outDir) : null
  const outPath = internal?.outPath === undefined ? basePath : internal.outPath

  const logging = {
    trace: internal?.trace ?? config.logging?.trace ?? false,
    emissions: internal?.emissions ?? config.logging?.emissions ?? "summary"
  }

  const outputs = {
    extension: internal?.outputs?.extension ?? config.outputs?.extension ?? false,
    lsp: internal?.outputs?.lsp ?? config.outputs?.lsp ?? false,
    meta: internal?.outputs?.meta ?? config.outputs?.meta ?? false,
    pathPatches: internal?.outputs?.pathPatches ?? config.outputs?.pathPatches ?? false,
    presets: internal?.outputs?.presets ?? config.outputs?.presets ?? false,
    tokens: internal?.outputs?.tokens ?? config.outputs?.tokens ?? false,
    schema: internal?.outputs?.schema ?? config.outputs?.schema ?? false
  }

  const resolvedInternal = {
    willEmitCss: internal?.willEmitCss ?? false,
    initialProcessing: internal?.initialProcessing ?? true
  }

  return {
    projectRoot,
    tokenPath: path.resolve(projectRoot, tokenRaw),
    outPath,
    logging,
    outputs,
    internal: resolvedInternal
  }
}