import { describe, expect, it } from 'vitest';
import { createTokenCache } from '@styleTokens/compiler/tracking/tokenCache';
import { createCompilerToken, createCssTokenGroup, createTokenGroup, } from '../../compiler.factory';
describe('[COMPILER]', () => {
    describe('createTokenCache', () => {
        it('starts empty when no groups are provided', () => {
            const cache = createTokenCache([]);
            expect(cache.getCssPaths()).toEqual([]);
            expect(cache.getMissingCssGroupPaths()).toEqual([]);
            expect(cache.getAllPostData()).toEqual([]);
            expect(cache.getCssDataGroups()).toEqual([]);
        });
        it('initializes with the provided groups', () => {
            const button = createCssTokenGroup({
                groupPath: '/tokens/button',
                cssPath: '/css/Button.module.css',
            });
            const surface = createCssTokenGroup({
                groupPath: '/tokens/surface',
                cssPath: '/css/Surface.module.css',
            });
            const cache = createTokenCache([button, surface]);
            expect(cache.getCssPaths()).toEqual([
                '/css/Button.module.css',
                '/css/Surface.module.css',
            ]);
        });
        it('indexes a group by every token path', () => {
            const firstToken = createCompilerToken({
                tokenPath: '/tokens/button/default.jsonc',
            });
            const secondToken = createCompilerToken({
                tokenPath: '/tokens/button/hover.jsonc',
            });
            const group = createTokenGroup({
                tokens: [firstToken, secondToken],
            });
            const cache = createTokenCache([group]);
            expect(cache.getGroupByTokenPath(firstToken.tokenPath)).toBe(group);
            expect(cache.getGroupByTokenPath(secondToken.tokenPath)).toBe(group);
        });
        it('returns undefined for unknown token paths', () => {
            const cache = createTokenCache([]);
            expect(cache.getGroupByTokenPath('/tokens/unknown.jsonc')).toBeUndefined();
        });
        it('indexes groups by css path', () => {
            const group = createCssTokenGroup({
                cssPath: '/css/Button.module.css',
            });
            const cache = createTokenCache([group]);
            expect(cache.getGroupByCssPath('/css/Button.module.css')).toBe(group);
        });
        it('returns undefined for unknown css paths', () => {
            const cache = createTokenCache([]);
            expect(cache.getGroupByCssPath('/css/Unknown.module.css')).toBeUndefined();
        });
        it('does not index groups without a css path', () => {
            const group = createTokenGroup({
                groupPath: '/tokens/button',
            });
            const cache = createTokenCache([group]);
            expect(cache.getCssPaths()).toEqual([]);
            expect(cache.getGroupByCssPath('/css/Button.module.css')).toBeUndefined();
        });
        it('returns all css paths', () => {
            const button = createCssTokenGroup({
                cssPath: '/css/Button.module.css',
            });
            const surface = createCssTokenGroup({
                cssPath: '/css/Surface.module.css',
            });
            const missing = createTokenGroup({
                groupPath: '/tokens/missing',
            });
            const cache = createTokenCache([
                button,
                surface,
                missing,
            ]);
            expect(cache.getCssPaths()).toEqual([
                '/css/Button.module.css',
                '/css/Surface.module.css',
            ]);
        });
        it('returns group paths for groups without css files', () => {
            const button = createCssTokenGroup({
                groupPath: '/tokens/button',
            });
            const missing = createTokenGroup({
                groupPath: '/tokens/missing',
            });
            const surface = createTokenGroup({
                groupPath: '/tokens/surface',
            });
            const cache = createTokenCache([
                button,
                missing,
                surface,
            ]);
            expect(cache.getMissingCssGroupPaths()).toEqual([
                '/tokens/missing',
                '/tokens/surface',
            ]);
        });
        it('adds a group to the indexes', () => {
            const token = createCompilerToken({
                tokenPath: '/tokens/button/default.jsonc',
            });
            const group = createCssTokenGroup({
                groupPath: '/tokens/button',
                cssPath: '/css/Button.module.css',
                tokens: [token],
            });
            const cache = createTokenCache([]);
            cache.addGroup(group);
            expect(cache.getGroupByTokenPath(token.tokenPath)).toBe(group);
            expect(cache.getGroupByCssPath(group.cssPath)).toBe(group);
            expect(cache.getCssPaths()).toEqual([
                group.cssPath,
            ]);
        });
        it('adds a group without a css path to the token index', () => {
            const token = createCompilerToken({
                tokenPath: '/tokens/button/default.jsonc',
            });
            const group = createTokenGroup({
                groupPath: '/tokens/button',
                tokens: [token],
            });
            const cache = createTokenCache([]);
            cache.addGroup(group);
            expect(cache.getGroupByTokenPath(token.tokenPath)).toBe(group);
            expect(cache.getCssPaths()).toEqual([]);
            expect(cache.getMissingCssGroupPaths()).toEqual([
                '/tokens/button',
            ]);
        });
        it('removes a group from all indexes', () => {
            const token = createCompilerToken({
                tokenPath: '/tokens/button/default.jsonc',
            });
            const group = createCssTokenGroup({
                groupPath: '/tokens/button',
                cssPath: '/css/Button.module.css',
                tokens: [token],
            });
            const cache = createTokenCache([group]);
            cache.removeGroup(group);
            expect(cache.getGroupByTokenPath(token.tokenPath)).toBeUndefined();
            expect(cache.getGroupByCssPath(group.cssPath)).toBeUndefined();
            expect(cache.getCssPaths()).toEqual([]);
        });
        it('can add a group after removing it', () => {
            const group = createCssTokenGroup();
            const cache = createTokenCache([group]);
            cache.removeGroup(group);
            cache.addGroup(group);
            expect(cache.getGroupByCssPath(group.cssPath)).toBe(group);
            expect(cache.getCssPaths()).toEqual([
                group.cssPath,
            ]);
        });
        describe('CSS data', () => {
            it('attaches css data to the matching group', () => {
                const group = createCssTokenGroup({
                    cssPath: '/css/Button.module.css',
                });
                const cache = createTokenCache([group]);
                const cssData = {
                    groupPath: group.groupPath,
                    cssPath: group.cssPath,
                    foundSelectors: [],
                    usableSelectors: [],
                    foundFinalVariables: [],
                    declaredVariables: [],
                    tokens: [],
                };
                cache.addCssData(cssData);
                expect(group.cssData).toBe(cssData);
            });
            it('ignores css data for an unknown css path', () => {
                const group = createCssTokenGroup({
                    cssPath: '/css/Button.module.css',
                });
                const cache = createTokenCache([group]);
                const cssData = {
                    groupPath: '/tokens/unknown',
                    cssPath: '/css/Unknown.module.css',
                    foundSelectors: [],
                    usableSelectors: [],
                    foundFinalVariables: [],
                    declaredVariables: [],
                    tokens: [],
                };
                cache.addCssData(cssData);
                expect(group.cssData).toBeUndefined();
            });
            it('returns groups with css data', () => {
                const button = createCssTokenGroup({
                    cssPath: '/css/Button.module.css',
                });
                const surface = createCssTokenGroup({
                    cssPath: '/css/Surface.module.css',
                });
                const cache = createTokenCache([button, surface]);
                const buttonCssData = {
                    groupPath: button.groupPath,
                    cssPath: button.cssPath,
                    foundSelectors: [],
                    usableSelectors: [],
                    foundFinalVariables: [],
                    declaredVariables: [],
                    tokens: [],
                };
                const surfaceCssData = {
                    groupPath: surface.groupPath,
                    cssPath: surface.cssPath,
                    foundSelectors: [],
                    usableSelectors: [],
                    foundFinalVariables: [],
                    declaredVariables: [],
                    tokens: [],
                };
                cache.addCssData(buttonCssData);
                cache.addCssData(surfaceCssData);
                expect(cache.getCssDataGroups()).toEqual([
                    button,
                    surface,
                ]);
            });
            it('throws when a css group has no css data', () => {
                const group = createCssTokenGroup({
                    cssPath: '/css/Button.module.css',
                });
                const cache = createTokenCache([group]);
                expect(() => cache.getCssDataGroups()).toThrow();
            });
            it('returns css data groups filtered by paths', () => {
                const button = createCssTokenGroup({
                    cssPath: '/css/Button.module.css',
                });
                const surface = createCssTokenGroup({
                    cssPath: '/css/Surface.module.css',
                });
                const cache = createTokenCache([button, surface]);
                cache.addCssData({
                    groupPath: button.groupPath,
                    cssPath: button.cssPath,
                    foundSelectors: [],
                    usableSelectors: [],
                    foundFinalVariables: [],
                    declaredVariables: [],
                    tokens: [],
                });
                cache.addCssData({
                    groupPath: surface.groupPath,
                    cssPath: surface.cssPath,
                    foundSelectors: [],
                    usableSelectors: [],
                    foundFinalVariables: [],
                    declaredVariables: [],
                    tokens: [],
                });
                expect(cache.getCssDataGroupsByPaths([
                    '/css/Surface.module.css',
                ])).toEqual([surface]);
            });
            it('returns no css data groups for unmatched paths', () => {
                const group = createCssTokenGroup({
                    cssPath: '/css/Button.module.css',
                });
                const cache = createTokenCache([group]);
                cache.addCssData({
                    groupPath: group.groupPath,
                    cssPath: group.cssPath,
                    foundSelectors: [],
                    usableSelectors: [],
                    foundFinalVariables: [],
                    declaredVariables: [],
                    tokens: [],
                });
                expect(cache.getCssDataGroupsByPaths([
                    '/css/Unknown.module.css',
                ])).toEqual([]);
            });
        });
        describe('PostCSS data', () => {
            it('stores post data by css path', () => {
                const cache = createTokenCache([]);
                const data = {
                    cssPath: '/css/Button.module.css',
                };
                cache.addPostData(data);
                expect(cache.getAllPostData()).toEqual([data]);
            });
            it('stores post data for multiple css paths', () => {
                const cache = createTokenCache([]);
                const button = {
                    cssPath: '/css/Button.module.css',
                };
                const surface = {
                    cssPath: '/css/Surface.module.css',
                };
                cache.addPostData(button);
                cache.addPostData(surface);
                expect(cache.getAllPostData()).toEqual([
                    button,
                    surface,
                ]);
            });
            it('replaces post data for the same css path', () => {
                const cache = createTokenCache([]);
                const first = {
                    cssPath: '/css/Button.module.css',
                };
                const second = {
                    cssPath: '/css/Button.module.css',
                };
                cache.addPostData(first);
                cache.addPostData(second);
                expect(cache.getAllPostData()).toEqual([second]);
            });
        });
    });
});
