import { formatLogPath } from '../../utils/string.js';
export function validateDuplicateVars(tokens) {
    const seenVariables = new Map();
    for (const token of tokens) {
        for (const variable of token.vars) {
            const identity = `${token.name}:${token.infix}:${variable.cssName}`;
            if (seenVariables.has(identity)) {
                const previous = seenVariables.get(identity);
                throw new Error([`❌ CSS variable identity collision!`,
                    `\nGenerated identity:`,
                    `   ${identity}`,
                    `\nSources:`,
                    `     ${formatLogPath(token.tokenPath)}`,
                    `     ${previous && formatLogPath(previous.tokenPath)}\n`
                ].join("\n"));
            }
            seenVariables.set(identity, {
                tokenPath: token.tokenPath
            });
        }
    }
}
