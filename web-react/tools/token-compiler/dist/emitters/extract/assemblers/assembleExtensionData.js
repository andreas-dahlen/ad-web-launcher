import { toCssVar } from '../../../oldSharedUtils/stringFormaters.js';
import path from 'node:path';
export function assembleExtensionData(allVariables, tokenData, outPath) {
    const variables = new Set(allVariables);
    for (const token of tokenData) {
        for (const variable of token.variables) {
            variables.add(toCssVar("final", token.infix, variable.cssName));
            for (const allowed of variable.allowed) {
                variables.add(toCssVar(allowed, token.infix, variable.cssName));
            }
        }
    }
    const outputFile = path.join(outPath, "metadata/variables.generated.json");
    return { variables: [...variables], outputFile };
}
