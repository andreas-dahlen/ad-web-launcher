import { describe, expect, it } from 'vitest';
import { analyzeWriteResult } from '@styleTokens/diagnostics/data/analyzers/analyzeWriteResult';
describe('[DIAGNOSTICS]', () => {
    describe('analyzeWriteResult', () => {
        it('groups written preset and token files', () => {
            const result = analyzeWriteResult({
                updated: [
                    '/src/shared/generated/presets/button.preset.ts',
                    '/src/shared/generated/tokenModules/button.token.ts',
                ],
                skipped: [],
            });
            expect(result).toEqual({
                presets: {
                    written: [
                        '/src/shared/generated/presets/button.preset.ts',
                    ],
                    skipped: [],
                },
                tokens: {
                    written: [
                        '/src/shared/generated/tokenModules/button.token.ts',
                    ],
                    skipped: [],
                },
            });
        });
        it('groups skipped preset and token files', () => {
            const result = analyzeWriteResult({
                updated: [],
                skipped: [
                    '/src/shared/generated/presets/button.preset.ts',
                    '/src/shared/generated/tokenModules/button.token.ts',
                ],
            });
            expect(result).toEqual({
                presets: {
                    written: [],
                    skipped: [
                        '/src/shared/generated/presets/button.preset.ts',
                    ],
                },
                tokens: {
                    written: [],
                    skipped: [
                        '/src/shared/generated/tokenModules/button.token.ts',
                    ],
                },
            });
        });
        it('ignores files that are not generated preset or token files', () => {
            const result = analyzeWriteResult({
                updated: [
                    '/src/shared/generated/metadata/metadata.json',
                    '/src/components/Button/Button.module.css',
                ],
                skipped: [
                    '/src/shared/generated/metadata/metadata.json',
                ],
            });
            expect(result).toEqual({
                presets: {
                    written: [],
                    skipped: [],
                },
                tokens: {
                    written: [],
                    skipped: [],
                },
            });
        });
        it('handles an undefined result', () => {
            expect(analyzeWriteResult(undefined)).toEqual({
                presets: {
                    written: [],
                    skipped: [],
                },
                tokens: {
                    written: [],
                    skipped: [],
                },
            });
        });
        it('preserves file order', () => {
            const result = analyzeWriteResult({
                updated: [
                    '/src/shared/generated/presets/zebra.preset.ts',
                    '/src/shared/generated/presets/alpha.preset.ts',
                    '/src/shared/generated/tokenModules/zebra.token.ts',
                    '/src/shared/generated/tokenModules/alpha.token.ts',
                ],
                skipped: [],
            });
            expect(result.presets.written).toEqual([
                '/src/shared/generated/presets/alpha.preset.ts',
                '/src/shared/generated/presets/zebra.preset.ts',
            ]);
            expect(result.tokens.written).toEqual([
                '/src/shared/generated/tokenModules/alpha.token.ts',
                '/src/shared/generated/tokenModules/zebra.token.ts',
            ]);
        });
    });
});
