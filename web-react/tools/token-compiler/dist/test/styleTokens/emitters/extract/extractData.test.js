import { describe, expect, it, vi } from 'vitest';
import { extractData } from '@styleTokens/emitters/extract/extractData';
import { assembleMetadata } from '@styleTokens/emitters/extract/assemblers/assembleMetadata';
import { assembleTokenData } from '@styleTokens/emitters/extract/assemblers/assembleTokenData';
import { assemblePresetData } from '@styleTokens/emitters/extract/assemblers/assemblePresetData';
import { assembleLspData } from '@styleTokens/emitters/extract/assemblers/assembleLspData';
import { assembleExtensionData } from '@styleTokens/emitters/extract/assemblers/assembleExtensionData';
vi.mock('@styleTokens/emitters/extract/assemblers/assembleMetadata');
vi.mock('@styleTokens/emitters/extract/assemblers/assembleTokenData');
vi.mock('@styleTokens/emitters/extract/assemblers/assemblePresetData');
vi.mock('@styleTokens/emitters/extract/assemblers/assembleLspData');
vi.mock('@styleTokens/emitters/extract/assemblers/assembleExtensionData');
describe('[EMITTERS]', () => {
    describe('extractData', () => {
        it('returns empty collections when there are no groups', () => {
            vi.mocked(assembleExtensionData)
                .mockReturnValue({
                variables: [],
            });
            vi.mocked(assembleLspData)
                .mockReturnValue({
                rgbVariables: [],
            });
            const result = extractData({
                groups: [],
                postData: [],
                runGroups: [],
            });
            expect(result).toEqual({
                outputData: {
                    presetFiles: [],
                    tokenData: [],
                    metadata: [],
                    extensionData: {
                        variables: [],
                    },
                    lspData: {
                        rgbVariables: [],
                    },
                },
                extractResult: {
                    omittedPresetFiles: [],
                },
            });
            expect(assembleExtensionData)
                .toHaveBeenCalledWith([], []);
            expect(assembleLspData)
                .toHaveBeenCalledWith([]);
        });
        it('assembles token and preset data from run groups', () => {
            const runGroup = {
                groupPath: '/tokens/button',
                cssPath: '/components/Button/Button.module.css',
                cssData: {},
            };
            const tokenData = {
                name: 'button',
                tokens: [],
            };
            const presetData = {
                presetName: 'buttonPreset',
            };
            vi.mocked(assembleTokenData)
                .mockReturnValue(tokenData);
            vi.mocked(assemblePresetData)
                .mockReturnValue(presetData);
            vi.mocked(assembleExtensionData)
                .mockReturnValue({ variables: [] });
            vi.mocked(assembleLspData)
                .mockReturnValue({ rgbVariables: [] });
            const result = extractData({
                groups: [],
                postData: [],
                runGroups: [runGroup],
            });
            expect(result.outputData.tokenData)
                .toEqual([tokenData]);
            expect(result.outputData.presetFiles)
                .toEqual([presetData]);
            expect(assembleTokenData)
                .toHaveBeenCalledWith(runGroup);
            expect(assemblePresetData)
                .toHaveBeenCalledWith(runGroup.cssData);
        });
        it('collects metadata from groups', () => {
            const group = {
                groupPath: '/tokens/button',
            };
            const metadata = {
                name: 'button',
            };
            vi.mocked(assembleMetadata)
                .mockReturnValue(metadata);
            vi.mocked(assembleExtensionData)
                .mockReturnValue({ variables: [] });
            vi.mocked(assembleLspData)
                .mockReturnValue({ rgbVariables: [] });
            const result = extractData({
                groups: [group],
                postData: [],
                runGroups: [],
            });
            expect(result.outputData.metadata)
                .toEqual([metadata]);
            expect(assembleMetadata)
                .toHaveBeenCalledWith(group);
        });
        it('records omitted preset files when preset assembly returns null', () => {
            const runGroup = {
                groupPath: '/tokens/button',
                cssPath: '/components/Button/Button.module.css',
                cssData: {},
            };
            vi.mocked(assembleTokenData)
                .mockReturnValue({
                name: 'button',
                tokens: [],
            });
            vi.mocked(assemblePresetData)
                .mockReturnValue(null);
            vi.mocked(assembleExtensionData)
                .mockReturnValue({ variables: [] });
            vi.mocked(assembleLspData)
                .mockReturnValue({ rgbVariables: [] });
            const result = extractData({
                groups: [],
                postData: [],
                runGroups: [runGroup],
            });
            expect(result.outputData.presetFiles)
                .toEqual([]);
            expect(result.extractResult.omittedPresetFiles)
                .toEqual([
                '/components/Button/Button.module.css',
            ]);
        });
        it('only collects successful run-group token and preset results', () => {
            const firstGroup = {
                groupPath: '/tokens/button',
                cssPath: '/components/Button/Button.module.css',
                cssData: {},
            };
            const secondGroup = {
                groupPath: '/tokens/input',
                cssPath: '/components/Input/Input.module.css',
                cssData: {},
            };
            const tokenData = {
                name: 'button',
                tokens: [],
            };
            const presetData = {
                presetName: 'buttonPreset',
            };
            vi.mocked(assembleTokenData)
                .mockReturnValueOnce(tokenData)
                .mockReturnValueOnce(undefined);
            vi.mocked(assemblePresetData)
                .mockReturnValueOnce(presetData)
                .mockReturnValueOnce(null);
            vi.mocked(assembleExtensionData)
                .mockReturnValue({ variables: [] });
            vi.mocked(assembleLspData)
                .mockReturnValue({ rgbVariables: [] });
            const result = extractData({
                groups: [],
                postData: [],
                runGroups: [
                    firstGroup,
                    secondGroup,
                ],
            });
            expect(result.outputData.tokenData)
                .toEqual([tokenData]);
            expect(result.outputData.presetFiles)
                .toEqual([presetData]);
            expect(result.extractResult.omittedPresetFiles)
                .toEqual([
                '/components/Input/Input.module.css',
            ]);
        });
        it('passes post data variables and assembled token variables to extension assembly', () => {
            const group = {
                groupPath: '/tokens/button',
            };
            const tokenData = {
                name: 'button',
                tokens: [
                    {
                        infix: 'button',
                        variables: [],
                    },
                ],
            };
            const postData = [
                {
                    variables: [
                        '--existing-color',
                    ],
                },
                {
                    variables: [
                        '--existing-radius',
                    ],
                },
            ];
            vi.mocked(assembleTokenData)
                .mockReturnValue(tokenData);
            vi.mocked(assembleExtensionData)
                .mockReturnValue({
                variables: [
                    '--existing-color',
                ],
            });
            vi.mocked(assembleLspData)
                .mockReturnValue({
                rgbVariables: [],
            });
            extractData({
                groups: [group],
                postData: postData,
                runGroups: [],
            });
            expect(assembleExtensionData)
                .toHaveBeenCalledWith([
                '--existing-color',
                '--existing-radius',
            ], tokenData.tokens);
        });
        it('passes all OKLCH variables to LSP assembly', () => {
            const postData = [
                {
                    oklchVariables: [
                        ['--button-color', 'oklch(70% 0.2 30)'],
                    ],
                },
                {
                    oklchVariables: [
                        ['--button-bg', 'oklch(80% 0.1 120)'],
                    ],
                },
            ];
            vi.mocked(assembleExtensionData)
                .mockReturnValue({ variables: [] });
            vi.mocked(assembleLspData)
                .mockReturnValue({
                rgbVariables: [],
            });
            extractData({
                groups: [],
                postData: postData,
                runGroups: [],
            });
            expect(assembleLspData)
                .toHaveBeenCalledWith([
                ['--button-color', 'oklch(70% 0.2 30)'],
                ['--button-bg', 'oklch(80% 0.1 120)'],
            ]);
        });
        it('returns assembled extension and LSP data', () => {
            const extensionData = {
                variables: [
                    '--button-color',
                ],
            };
            const lspData = {
                rgbVariables: [
                    '--button-color: rgb(100% 0% 0%)',
                ],
            };
            vi.mocked(assembleExtensionData)
                .mockReturnValue(extensionData);
            vi.mocked(assembleLspData)
                .mockReturnValue(lspData);
            const result = extractData({
                groups: [],
                postData: [],
                runGroups: [],
            });
            expect(result.outputData.extensionData)
                .toBe(extensionData);
            expect(result.outputData.lspData)
                .toBe(lspData);
        });
        it('assembles token data from groups independently of run groups', () => {
            const group = {
                groupPath: '/tokens/button',
                cssData: {},
            };
            const runGroup = {
                groupPath: '/tokens/input',
                cssPath: '/components/Input/Input.module.css',
                cssData: {},
            };
            const groupTokenData = {
                name: 'button',
                tokens: [],
            };
            const runTokenData = {
                name: 'input',
                tokens: [],
            };
            vi.mocked(assembleTokenData)
                .mockReturnValueOnce(runTokenData)
                .mockReturnValueOnce(groupTokenData);
            vi.mocked(assemblePresetData)
                .mockReturnValue(null);
            vi.mocked(assembleExtensionData)
                .mockReturnValue({ variables: [] });
            vi.mocked(assembleLspData)
                .mockReturnValue({ rgbVariables: [] });
            extractData({
                groups: [group],
                postData: [],
                runGroups: [runGroup],
            });
            expect(assembleTokenData)
                .toHaveBeenNthCalledWith(1, runGroup);
            expect(assembleTokenData)
                .toHaveBeenNthCalledWith(2, group);
            expect(assembleExtensionData)
                .toHaveBeenCalledWith([], groupTokenData.tokens);
        });
    });
});
