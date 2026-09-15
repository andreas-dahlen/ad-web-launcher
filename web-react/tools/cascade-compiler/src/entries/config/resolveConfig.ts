import path from 'node:path';

import { loadCompilerConfig } from './loadCompilerConfig.ts';
import type { CompilerConfig, CompilerInternalConfig } from '../../types/run.types.ts';
import { findPackageRoot } from './findPackageRoot.ts';

export function resolveConfig(
  projectRoot: string,
  internal?: CompilerInternalConfig
): CompilerConfig {
  const config = loadCompilerConfig(projectRoot)
  if (!config.tokenFolder) {
    throw new Error("Error: Couldn't resolve token path in either cascade.config.json")
  }

  const packageRoot = findPackageRoot()
  const generatedPath = internal?.generatedPath ?? path.join(packageRoot, 'generated')

  const basePath = config.outDir ? path.resolve(projectRoot, config.outDir) : null
  const outPath = internal?.outPath === undefined ? basePath : internal.outPath

  const logging = {
    trace: internal?.trace ?? config.logging?.trace ?? false,
    emissions: internal?.emissions ?? config.logging?.emissions ?? "summary"
  }

  const outputs = {
    extension: config.outputs?.extension ?? false,
    lsp: config.outputs?.lsp ?? false,
    meta: config.outputs?.meta ?? false,
    pathPatches: config.outputs?.pathPatches ?? false,
    presets: config.outputs?.presets ?? false,
    tokens: config.outputs?.tokens ?? false,
    schema: config.outputs?.schema ?? false,
    package: config.outputs?.package ?? false
  }

  const resolvedInternal = {
    willEmitCss: internal?.willEmitCss ?? false,
    initialProcessing: internal?.initialProcessing ?? true,
  }

  return {
    projectRoot,
    tokenPath: path.resolve(projectRoot, config.tokenFolder),
    generatedPath,
    outPath,
    logging,
    outputs,
    internal: resolvedInternal
  }
}