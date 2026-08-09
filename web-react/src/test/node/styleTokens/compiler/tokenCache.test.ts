import { describe, expect, it } from 'vitest'
import {
  createTokenCache,
} from '@styleTokens/compiler/tracking/tokenCache'
import {
  createCompilerToken,
  createCssTokenGroup,
  createTokenGroup,
} from '../compiler.factory'

describe('[COMPILER]', () => {
  describe('createTokenCache', () => {
    it('starts empty when no groups are provided', () => {
      const cache = createTokenCache([])

      expect(cache.getGroups()).toEqual([])
      expect(cache.getCssPaths()).toEqual([])
      expect(cache.getMissingCssGroupPaths()).toEqual([])
    })

    it('initializes with the provided groups', () => {
      const button = createCssTokenGroup({
        groupPath: '/tokens/button',
        cssPath: '/css/Button.module.css',
      })

      const surface = createCssTokenGroup({
        groupPath: '/tokens/surface',
        cssPath: '/css/Surface.module.css',
      })

      const cache = createTokenCache([button, surface])

      expect(cache.getGroups()).toEqual([button, surface])
    })

    it('indexes a group by group path', () => {
      const group = createTokenGroup({
        groupPath: '/tokens/button',
      })

      const cache = createTokenCache([group])

      expect(
        cache.getGroupByGroupPath('/tokens/button')
      ).toBe(group)
    })

    it('indexes a group by css path', () => {
      const group = createCssTokenGroup({
        cssPath: '/css/Button.module.css',
      })

      const cache = createTokenCache([group])

      expect(
        cache.getGroupByCssPath('/css/Button.module.css')
      ).toBe(group)
    })

    it('does not index a group without a css path', () => {
      const group = createTokenGroup({
        groupPath: '/tokens/button',
      })

      const cache = createTokenCache([group])

      expect(
        cache.getGroupByCssPath('/css/Button.module.css')
      ).toBeUndefined()

      expect(cache.getCssPaths()).toEqual([])
    })

    it('indexes a group by every token path', () => {
      const firstToken = createCompilerToken({
        tokenPath: '/tokens/button/default.jsonc',
      })

      const secondToken = createCompilerToken({
        tokenPath: '/tokens/button/hover.jsonc',
      })

      const group = createTokenGroup({
        tokens: [firstToken, secondToken],
      })

      const cache = createTokenCache([group])

      expect(
        cache.getGroupByTokenPath(firstToken.tokenPath)
      ).toBe(group)

      expect(
        cache.getGroupByTokenPath(secondToken.tokenPath)
      ).toBe(group)
    })

    it('returns undefined for unknown token paths', () => {
      const cache = createTokenCache([])

      expect(
        cache.getGroupByTokenPath('/tokens/unknown.jsonc')
      ).toBeUndefined()
    })

    it('returns undefined for unknown css paths', () => {
      const cache = createTokenCache([])

      expect(
        cache.getGroupByCssPath('/css/Unknown.module.css')
      ).toBeUndefined()
    })

    it('returns undefined for unknown group paths', () => {
      const cache = createTokenCache([])

      expect(
        cache.getGroupByGroupPath('/tokens/unknown')
      ).toBeUndefined()
    })

    it('returns all css paths', () => {
      const button = createCssTokenGroup({
        cssPath: '/css/Button.module.css',
      })

      const surface = createCssTokenGroup({
        cssPath: '/css/Surface.module.css',
      })

      const missing = createTokenGroup({
        groupPath: '/tokens/missing',
      })

      const cache = createTokenCache([
        button,
        surface,
        missing,
      ])

      expect(cache.getCssPaths()).toEqual([
        '/css/Button.module.css',
        '/css/Surface.module.css',
      ])
    })

    it('returns group paths for groups without css files', () => {
      const button = createCssTokenGroup({
        groupPath: '/tokens/button',
      })

      const missing = createTokenGroup({
        groupPath: '/tokens/missing',
      })

      const surface = createTokenGroup({
        groupPath: '/tokens/surface',
      })

      const cache = createTokenCache([
        button,
        missing,
        surface,
      ])

      expect(cache.getMissingCssGroupPaths()).toEqual([
        '/tokens/missing',
        '/tokens/surface',
      ])
    })

    it('adds a group to all applicable indexes', () => {
      const token = createCompilerToken({
        tokenPath: '/tokens/button/default.jsonc',
      })

      const group = createCssTokenGroup({
        groupPath: '/tokens/button',
        cssPath: '/css/Button.module.css',
        tokens: [token],
      })

      const cache = createTokenCache([])

      cache.addGroup(group)

      expect(cache.getGroups()).toEqual([group])

      expect(
        cache.getGroupByGroupPath(group.groupPath)
      ).toBe(group)

      expect(
        cache.getGroupByCssPath(group.cssPath)
      ).toBe(group)

      expect(
        cache.getGroupByTokenPath(token.tokenPath)
      ).toBe(group)
    })

    it('adds a group without a css path to the token and group indexes', () => {
      const token = createCompilerToken({
        tokenPath: '/tokens/button/default.jsonc',
      })

      const group = createTokenGroup({
        groupPath: '/tokens/button',
        tokens: [token],
      })

      const cache = createTokenCache([])

      cache.addGroup(group)

      expect(cache.getGroups()).toEqual([group])

      expect(
        cache.getGroupByGroupPath(group.groupPath)
      ).toBe(group)

      expect(
        cache.getGroupByTokenPath(token.tokenPath)
      ).toBe(group)

      expect(cache.getCssPaths()).toEqual([])
    })

    it('removes a group from all indexes', () => {
      const token = createCompilerToken({
        tokenPath: '/tokens/button/default.jsonc',
      })

      const group = createCssTokenGroup({
        groupPath: '/tokens/button',
        cssPath: '/css/Button.module.css',
        tokens: [token],
      })

      const cache = createTokenCache([group])

      cache.removeGroup(group)

      expect(cache.getGroups()).toEqual([])

      expect(
        cache.getGroupByGroupPath(group.groupPath)
      ).toBeUndefined()

      expect(
        cache.getGroupByCssPath(group.cssPath)
      ).toBeUndefined()

      expect(
        cache.getGroupByTokenPath(token.tokenPath)
      ).toBeUndefined()

      expect(cache.getCssPaths()).toEqual([])
    })

    it('removes a group without a css path from its indexes', () => {
      const token = createCompilerToken({
        tokenPath: '/tokens/button/default.jsonc',
      })

      const group = createTokenGroup({
        groupPath: '/tokens/button',
        tokens: [token],
      })

      const cache = createTokenCache([group])

      cache.removeGroup(group)

      expect(cache.getGroups()).toEqual([])

      expect(
        cache.getGroupByGroupPath(group.groupPath)
      ).toBeUndefined()

      expect(
        cache.getGroupByTokenPath(token.tokenPath)
      ).toBeUndefined()
    })

    it('returns a snapshot of the groups', () => {
      const group = createTokenGroup()

      const cache = createTokenCache([group])

      const groups = cache.getGroups()

      groups.length = 0

      expect(cache.getGroups()).toEqual([group])
    })

    it('preserves group insertion order', () => {
      const first = createTokenGroup({
        groupPath: '/tokens/first',
      })

      const second = createTokenGroup({
        groupPath: '/tokens/second',
      })

      const third = createTokenGroup({
        groupPath: '/tokens/third',
      })

      const cache = createTokenCache([
        first,
        second,
        third,
      ])

      expect(cache.getGroups()).toEqual([
        first,
        second,
        third,
      ])
    })

    it('can add the same group after removing it', () => {
      const group = createCssTokenGroup()

      const cache = createTokenCache([group])

      cache.removeGroup(group)
      cache.addGroup(group)

      expect(cache.getGroups()).toEqual([group])

      expect(
        cache.getGroupByGroupPath(group.groupPath)
      ).toBe(group)

      expect(
        cache.getGroupByCssPath(group.cssPath)
      ).toBe(group)
    })
  })
})