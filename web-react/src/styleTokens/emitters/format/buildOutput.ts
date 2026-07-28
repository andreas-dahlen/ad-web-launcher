import buildTokenFiles from './builders/buildTokenFiles.ts';
import type { EmitData } from '../data/buildData.ts';
import buildPresetFiles from './builders/buildPresetFiles.ts';

export type FileOutput = {
  filePath: string;
  content: string;
};

export default function buildOutput(data: EmitData): FileOutput[] {
  return [
    ...buildPresetFiles(data.presetFiles),
    ...buildTokenFiles(data.tokenFiles)
  ]
}