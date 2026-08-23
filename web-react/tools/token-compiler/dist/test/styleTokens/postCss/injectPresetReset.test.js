import { describe, expect, it } from 'vitest';
import postcss from 'postcss';
import { injectPresetResets } from '@styleTokens/postCss/inject/injectPresetResets';
function createRule() {
    const root = postcss.parse(`
    .button {
      color: var(--final-button-back-ground);
    }
  `);
    const rule = root.first;
    if (rule?.type !== 'rule') {
        throw new Error('Expected a CSS rule');
    }
    return rule;
}
function createToken() {
    return {
        name: 'button',
        infix: 'button',
        tokenPath: '/tokens/button/default.jsonc',
        vars: [],
    };
}
function createVariable(overrides = {}) {
    return {
        key: 'bg',
        name: 'background',
        cssName: 'back-ground',
        values: {},
        effectiveAllowed: ['p'],
        ...overrides,
    };
}
function createGroup(overrides = {}) {
    return {
        groupPath: '/tokens/button',
        cssPath: '/components/Button/Button.module.css',
        tokens: [],
        ...overrides,
    };
}
function createResetData(rule, ...variables) {
    return [
        [rule, new Set(variables)],
    ];
}
function getDeclarations(rule) {
    return rule.nodes?.filter(node => node.type === 'decl') ?? [];
}
describe('[POSTCSS]', () => {
    describe('injectPresetResets', () => {
        it('injects a preset reset for an allowed variable', () => {
            const rule = createRule();
            const token = createToken();
            const variable = createVariable();
            const group = createGroup({
                tokens: [
                    {
                        ...token,
                        vars: [variable],
                    },
                ],
            });
            const data = createResetData(rule, '--final-button-back-ground');
            injectPresetResets(data, group);
            const declarations = getDeclarations(rule);
            const reset = declarations.at(-1);
            expect(reset).toMatchObject({
                prop: '--p-button-back-ground',
                value: 'initial',
            });
        });
        it('does not inject a reset when p is not allowed', () => {
            const rule = createRule();
            const token = createToken();
            const variable = createVariable({
                effectiveAllowed: ['f'],
            });
            const group = createGroup({
                tokens: [
                    {
                        ...token,
                        vars: [variable],
                    },
                ],
            });
            const data = createResetData(rule, '--final-button-back-ground');
            injectPresetResets(data, group);
            expect(getDeclarations(rule).some(declaration => declaration.type === 'decl' &&
                declaration.prop === '--p-button-back-ground')).toBe(false);
        });
        it('injects resets for multiple final variables', () => {
            const rule = createRule();
            const token = createToken();
            const group = createGroup({
                tokens: [
                    {
                        ...token,
                        vars: [
                            createVariable({
                                name: 'backGround',
                                cssName: 'back-ground'
                            }),
                            createVariable({
                                key: 'color',
                                name: 'color',
                                cssName: 'color'
                            }),
                        ],
                    },
                ],
            });
            const data = createResetData(rule, '--final-button-back-ground', '--final-button-color');
            injectPresetResets(data, group);
            const declarations = getDeclarations(rule);
            expect(declarations.at(-2)).toMatchObject({
                prop: '--p-button-back-ground',
                value: 'initial',
            });
            expect(declarations.at(-1)).toMatchObject({
                prop: '--p-button-color',
                value: 'initial',
            });
        });
        it('ignores unknown final variables', () => {
            const rule = createRule();
            const group = createGroup();
            const data = createResetData(rule, '--final-button-back-ground');
            injectPresetResets(data, group);
            expect(getDeclarations(rule)).toHaveLength(1);
        });
        it('resolves variables using the token infix', () => {
            const rule = createRule();
            const token = createToken();
            token.infix = 'surface';
            const variable = createVariable({
                name: 'borderRadius',
                cssName: 'border-radius'
            });
            const group = createGroup({
                tokens: [
                    {
                        ...token,
                        vars: [variable],
                    },
                ],
            });
            const data = createResetData(rule, '--final-surface-border-radius');
            injectPresetResets(data, group);
            const declarations = getDeclarations(rule);
            expect(declarations.at(-1)).toMatchObject({
                prop: '--p-surface-border-radius',
                value: 'initial',
            });
        });
        it('uses the variable name rather than its key', () => {
            const rule = createRule();
            const token = createToken();
            const variable = createVariable({
                key: 'bg',
                name: 'backGround',
                cssName: 'back-ground'
            });
            const group = createGroup({
                tokens: [
                    {
                        ...token,
                        vars: [variable],
                    },
                ],
            });
            const data = createResetData(rule, '--final-button-back-ground');
            injectPresetResets(data, group);
            const declarations = getDeclarations(rule);
            expect(declarations.at(-1)).toMatchObject({
                prop: '--p-button-back-ground',
            });
        });
    });
});
