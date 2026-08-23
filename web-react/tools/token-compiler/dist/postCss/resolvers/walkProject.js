import { assert } from '../../utils/assertions.js';
export function walkProject(root, cssPath) {
    const variables = new Set();
    const oklchVariables = new Map();
    root.walkDecls(decl => {
        if (!decl.prop.startsWith('--')) {
            return;
        }
        assert.cssVariable(decl.prop);
        variables.add(decl.prop);
        const value = decl.value.trim();
        if (value.startsWith('oklch(')) {
            oklchVariables.set(decl.prop, value);
        }
    });
    return {
        cssPath,
        variables: [...variables],
        oklchVariables: [...oklchVariables]
    };
}
