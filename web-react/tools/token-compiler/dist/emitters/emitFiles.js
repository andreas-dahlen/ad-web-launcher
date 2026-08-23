import { extractData } from './extract/extractData.js';
import { generateOutput } from './generate/generateOutput.js';
import { writeFiles } from './write/writeFiles.js';
import { patchFiles } from './write/patchFiles.js';
export function emitFiles(cache, run) {
    const { extractResult, outputData } = extractData(cache, run);
    const { files, patches } = generateOutput(outputData);
    const patchResult = patchFiles(patches);
    const writeResult = writeFiles(files);
    return {
        extractResult,
        writeResult,
        patchResult
    };
}
