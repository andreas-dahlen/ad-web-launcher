import { describe, expect, it } from 'vitest';
import { assembleExtensionData } from '@styleTokens/emitters/extract/assemblers/assembleExtensionData';
function createToken(overrides = {}) {
    return {
        infix: 'button',
        variables: [
            {
                cssName: 'test-color',
                key: 'color',
                allowed: ['o', 's'],
                values: {},
            },
        ],
        ...overrides,
    };
}
describe('[EMITTERS]', () => {
    describe('assembleExtensionData', () => {
        it('preserves existing variables', () => {
            const allVariables = [
                '--existing-color',
                '--existing-radius',
            ];
            const result = assembleExtensionData(allVariables, []);
            expect(result).toEqual({
                variables: allVariables,
            });
        });
        it('adds the final variable for each token variable', () => {
            const result = assembleExtensionData([], [
                createToken(),
            ]);
            expect(result.variables).toContain('--final-button-test-color');
        });
        it('adds variables for every allowed prefix', () => {
            const result = assembleExtensionData([], [
                createToken(),
            ]);
            expect(result.variables).toEqual([
                '--final-button-test-color',
                '--o-button-test-color',
                '--s-button-test-color',
            ]);
        });
        it('assembles variables from multiple tokens', () => {
            const result = assembleExtensionData([], [
                createToken({
                    infix: 'button',
                    variables: [
                        {
                            cssName: 'test-color',
                            key: 'color',
                            allowed: ['o'],
                            values: {},
                        },
                    ],
                }),
                createToken({
                    infix: 'button_hover',
                    variables: [
                        {
                            cssName: 'test-color',
                            key: 'color',
                            allowed: ['s'],
                            values: {},
                        },
                    ],
                }),
            ]);
            expect(result.variables).toEqual([
                '--final-button-test-color',
                '--o-button-test-color',
                '--final-button_hover-test-color',
                '--s-button_hover-test-color',
            ]);
        });
        it('deduplicates existing and generated variables', () => {
            const allVariables = [
                '--final-button-test-color',
                '--existing-color'
            ];
            const result = assembleExtensionData(allVariables, [
                createToken(),
            ]);
            expect(result.variables).toEqual([
                '--final-button-test-color',
                '--existing-color',
                '--o-button-test-color',
                '--s-button-test-color'
            ]);
        });
        it('does not add prefix variants when none are allowed', () => {
            const result = assembleExtensionData([], [
                createToken({
                    variables: [
                        {
                            cssName: 'test-color',
                            key: 'color',
                            allowed: [],
                            values: {},
                        },
                    ],
                }),
            ]);
            expect(result.variables).toEqual([
                '--final-button-test-color',
            ]);
        });
        it('returns an empty collection when there are no variables', () => {
            expect(assembleExtensionData([], [])).toEqual({
                variables: [],
            });
        });
    });
});
