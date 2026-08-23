import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { assemblePresetData } from '@styleTokens/emitters/extract/assemblers/assemblePresetData';
function createCssData(overrides = {}) {
    return {
        groupPath: '/tokens/button',
        cssPath: '/components/Button/Button.module.css',
        foundSelectors: [],
        usableSelectors: ['primary'],
        foundFinalVariables: [],
        declaredVariables: [],
        tokens: [],
        ...overrides,
    };
}
describe('[EMITTERS]', () => {
    describe('assemblePresetData', () => {
        it('builds preset names from the group name', () => {
            const result = assemblePresetData(createCssData({
                groupPath: '/tokens/button',
            }));
            expect(result).toMatchObject({
                presetName: 'buttonPreset',
                typeName: 'ButtonPreset',
            });
        });
        it('builds the generated preset file path', () => {
            const result = assemblePresetData(createCssData({
                groupPath: '/tokens/button',
            }));
            expect(result?.presetFile).toContain('/src/shared/generated/presets/button.preset.ts');
        });
        it('creates a relative CSS import path', () => {
            const generatedDir = path.resolve('./src/shared/generated/presets');
            const cssPath = path.resolve('./src/components/Button/Button.module.css');
            const result = assemblePresetData(createCssData({ cssPath }));
            expect(result?.cssImport).toBe(path.relative(generatedDir, cssPath));
        });
        it('normalizes Windows path separators in the CSS import', () => {
            const result = assemblePresetData(createCssData({
                cssPath: String.raw `C:\project\src\components\Button\Button.module.css`,
            }));
            expect(result?.cssImport).not.toContain('\\');
        });
        it('filters non-preset selectors', () => {
            const result = assemblePresetData(createCssData({
                groupPath: '/tokens/button',
                usableSelectors: [
                    'button',
                    'button_$state',
                    'active',
                    'focusUtil',
                ],
            }));
            expect(result?.selectors).toEqual([
                'button_$state',
                'active',
            ]);
        });
        it('returns null when no preset selectors remain', () => {
            const result = assemblePresetData(createCssData({
                groupPath: '/tokens/svg',
                usableSelectors: [
                    'svg',
                    'focusUtil',
                    'debugUtil',
                ],
            }));
            expect(result).toBeNull();
        });
        it('preserves the CSS path in the generated import', () => {
            const result = assemblePresetData(createCssData({
                cssPath: '/components/Layout/Layout.module.css',
            }));
            expect(result?.cssImport).toContain('Layout/Layout.module.css');
        });
    });
});
