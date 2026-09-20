import path from 'node:path';

import { loadCompilerConfig } from './loadCompilerConfig.ts';
import type { CompilerConfigAndIssues, CompilerInternalConfig, CompilerLogs, CompilerOutputs, InternalConfig, PresetIgnore } from '../../types/run.types.ts';
import { findPackageRoot } from './findPackageRoot.ts';

export function resolveConfig(
  projectRoot: string,
  internal?: CompilerInternalConfig
): CompilerConfigAndIssues {
  const { config, issues } = loadCompilerConfig(projectRoot)

  const packageRoot = findPackageRoot()

  const logging = {
    trace: internal?.trace ?? config.logging?.trace ?? false,
    emissions: internal?.emissions ?? config.logging?.emissions ?? "summary"
  } satisfies CompilerLogs

  const outputs = {
    extension: config.outputs?.extension ?? false,
    lsp: config.outputs?.lsp ?? false,
    meta: config.outputs?.meta ?? false,
    pathPatches: config.outputs?.pathPatches ?? false,
    presets: config.outputs?.presets ?? false,
    tokens: config.outputs?.tokens ?? false,
    schema: config.outputs?.schema ?? false,
    package: config.outputs?.package ?? false
  } satisfies CompilerOutputs

  const presetIgnore = config.presetIgnore ?? [] satisfies PresetIgnore

  const resolvedInternal = {
    generatedPath: internal?.generatedPath ?? path.join(packageRoot, 'generated'),
    willEmitCss: internal?.willEmitCss ?? false,
    initialProcessing: internal?.initialProcessing ?? true,
  } satisfies InternalConfig

  const tokenFolder = config.tokenFolder ?? "src/test"

  return {
    config: {
      projectRoot,
      tokenPath: path.resolve(projectRoot, tokenFolder),
      logging,
      outputs,
      presetIgnore,
      internal: resolvedInternal
    }, issues
  }
}