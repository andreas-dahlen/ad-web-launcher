export function injectPresetResets(data, group) {
    for (const [rule, variables] of data) {
        for (const cssVar of variables) {
            const variable = findVariable(cssVar, group);
            if (!variable?.effectiveAllowed.includes('p')) {
                continue;
            }
            rule.append({
                prop: toPresetVar(cssVar),
                value: 'initial',
            });
        }
    }
}
function toPresetVar(cssVar) {
    return cssVar.replace("--final-", "--p-");
}
function findVariable(cssVar, group) {
    for (const token of group.tokens) {
        const prefix = `${token.infix}-`;
        if (!cssVar.startsWith(`--final-${prefix}`)) {
            continue;
        }
        const cssName = cssVar.slice(`--final-${prefix}`.length);
        return token.vars.find(variable => variable.cssName === cssName);
    }
    return undefined;
}
