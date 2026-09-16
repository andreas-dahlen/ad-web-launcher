import { formatTokenFiles } from './format/formatTokenFiles.ts';
import { formatPresetFiles } from './format/formatPresetFiles.ts';
import { formatMetaFile } from './format/formatMetaFile.ts';
import { formatPathPatches } from './format/formatPathPatches.ts';
import { formatLspFile } from './format/formatLspFile.ts';
import { formatExtensionFile } from './format/formatExtensionFile.ts';
import type { CompilerConfig } from '../../types/run.types.ts';
import type { EmitData, GeneratedOutput } from '../../types/emitter.types.ts';
import { formatPackageFile } from './format/formatPackageFile.ts';
import { formatJsonSchema } from './format/formatJsonSchema.ts';

export function generateOutput(
  data: EmitData,
  config: CompilerConfig
): GeneratedOutput {

  return {
    files: [
      ...(config.outputs.presets ? formatPresetFiles(data.presetFiles) : []),
      ...(config.outputs.tokens ? formatTokenFiles(data.tokenFiles) : []),
      ...(config.outputs.meta ? [formatMetaFile(data.metadata)] : []),
      ...(config.outputs.lsp ? [formatLspFile(data.lspData)] : []),
      ...(config.outputs.extension ? [formatExtensionFile(data.extensionData)] : []),
      ...(config.outputs.schema ? [formatJsonSchema(data.jsonSchema)] : []),
      ...(config.outputs.package ? formatPackageFile(data.packageData) : [])
    ],
    patches: config.outputs.pathPatches
      ? formatPathPatches(data.metadata)
      : []
  }
}
