import { formatTokenFiles } from './format/formatTokenFiles.js';
import { formatPresetFiles } from './format/formatPresetFiles.js';
import { formatMetaFile } from './format/formatMetaFile.js';
import { formatPathPatches } from './format/formatPathPatches.js';
import { formatLspFile } from './format/formatLspFile.js';
import { formatExtensionFile } from './format/formatExtensionFile.js';
export function generateOutput(data) {
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
    };
}
