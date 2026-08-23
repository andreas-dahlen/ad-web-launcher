import { validateDuplicateVars } from './validateDuplicateVars.js';
export function buildTokenGroup(groupPath, tokens, cssPath) {
    validateDuplicateVars(tokens);
    return {
        groupPath,
        cssPath,
        tokens
    };
}
