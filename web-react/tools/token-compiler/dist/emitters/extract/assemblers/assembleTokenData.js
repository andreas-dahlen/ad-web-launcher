import path from 'node:path';
import { toCamelCase, toPascalCase } from '../../../oldSharedUtils/stringFormaters.js';
import { extractGroupName } from '../../../compiler/resolvers/extractGroupName.js';
export function assembleTokenData(group, outPath) {
    const rawName = extractGroupName(group.groupPath);
    const name = toCamelCase(rawName);
    const styleName = `${name}Style`;
    const typeName = `${toPascalCase(rawName)}Style`;
    const outputFile = path.join(outPath, `tokens/${name}.token.ts`);
    const tokens = [];
    for (const token of group.tokens) {
        const variables = token.vars.map((v) => {
            return {
                cssName: v.cssName,
                key: v.key,
                allowed: v.effectiveAllowed,
                values: v.values
            };
        });
        tokens.push({ variables, infix: token.infix });
    }
    return {
        outputFile,
        groupPath: group.groupPath,
        name,
        styleName,
        typeName,
        tokens
    };
}
