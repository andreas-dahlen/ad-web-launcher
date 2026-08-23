import path from 'node:path';
import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.js';
export function assembleMetadata(group, outPath) {
    const outputFile = path.join(outPath, "metadata/metadata.json");
    const name = extractGroupName(group.groupPath);
    return {
        name,
        groupPath: group.groupPath,
        tokenFiles: group.tokens.map(g => g.tokenPath),
        cssFile: group.cssPath,
        outputFile
    };
}
