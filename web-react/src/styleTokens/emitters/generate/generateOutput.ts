import type { EmitData } from '../extract/extractData.ts';
import { formatTokenFiles } from './format/formatTokenFiles.ts';
import { formatPresetFiles } from './format/formatPresetFiles.ts';
import { formatMetaFile } from './format/formatMetaFile.ts';
import { formatTokenPatch } from './format/formatTokenPatch.ts';
import { formatLspFile } from './format/formatLspFile.ts';
import { formatExtensionFile } from './format/formatExtensionFile.ts';

export type FormatResult = {
  filePath: string;
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
      formatLspFile(data.tokenFiles),
      formatExtensionFile(data.allVariables)
    ],
    patches: [
      ...formatTokenPatch(data.metadata)
    ]
  }
}