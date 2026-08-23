import type { EmitData } from '../extract/extractData.js';
import { formatTokenFiles } from './format/formatTokenFiles.js';
import { formatPresetFiles } from './format/formatPresetFiles.js';
import { formatMetaFile } from './format/formatMetaFile.js';
import { formatPathPatches } from './format/formatPathPatches.js';
import { formatLspFile } from './format/formatLspFile.js';
import { formatExtensionFile } from './format/formatExtensionFile.js';

export type FormatResult = {
  outputFile: string;
  content: string;
};

export type GeneratedOutput = {
  files: FormatResult[]
  patches: FormatResult[]
}

export function generateOutput(data: EmitData): GeneratedOutput {
  return {
    files: [
      ...formatPresetFiles(data.presetFiles),
      ...formatTokenFiles(data.tokenFiles),
      formatMetaFile(data.metadata),
      formatLspFile(data.lspData),
      formatExtensionFile(data.extensionData)
    ],
    patches: [
      ...formatPathPatches(data.metadata)
    ]
  }
}
