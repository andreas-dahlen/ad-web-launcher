import { toCssVar, toCssVarPrefix } from '../../../oldSharedUtils/stringFormaters.js';
export function analyzeVariableUsage(group) {
    const result = [];
    const found = new Set(group.cssData.foundFinalVariables);
    for (const token of group.tokens) {
        const declared = new Set(token.vars.map(variable => toCssVar("final", token.infix, variable.cssName)));
        const missing = [];
        const unused = [];
        for (const cssVar of found) {
            if (cssVar.startsWith(toCssVarPrefix("final", token.infix)) &&
                !declared.has(cssVar)) {
                missing.push(cssVar);
            }
        }
        for (const cssVar of declared) {
            if (!found.has(cssVar)) {
                unused.push(cssVar);
            }
        }
        if (missing.length > 0 || unused.length > 0) {
            result.push({
                name: token.name,
                infix: token.infix,
                missing,
                unused,
            });
        }
    }
    return result;
}
