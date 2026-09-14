import type { PostData } from '../../types/compiler.types.ts';
import type { CssData, CssDataTokenGroup, CssTokenGroup, TokenGroup } from '../../types/compiler.types.ts';
import type { CompilerConfig } from '../../types/run.types.ts';
import type { EmitConfig } from '../../types/emitter.types.ts';
import { assert } from '../../utils/assertions.ts';

export type TokenCache = ReturnType<typeof createTokenCache>;

// In-memory compiler snapshot.
// Built from token sources at startup and updated when token files change.
export function createTokenCache(initialGroups: TokenGroup[], config: CompilerConfig) {

  const tokenGroups = new Set<TokenGroup>()

  const groupByTokenPath = new Map<string, TokenGroup>()
  const groupByCssPath = new Map<string, CssTokenGroup>()
  const postData = new Map<string, PostData>()

  function addGroup(group: TokenGroup) {
    tokenGroups.add(group)

    for (const token of group.tokens) {
      groupByTokenPath.set(token.tokenPath, group)
    }
    if (!group.cssPath) return
    assert.hasCssPath(group)
    groupByCssPath.set(group.cssPath, group)
  }

  function removeGroup(group: TokenGroup) {
    tokenGroups.delete(group)


    for (const token of group.tokens) {
      groupByTokenPath.delete(token.tokenPath)
    }

    if (!group.cssPath) return
    groupByCssPath.delete(group.cssPath)
  }

  for (const group of initialGroups) {
    addGroup(group)
  }

  return {
    addGroup,
    removeGroup,

    addCssData(cssData: CssData) {
      const group = groupByCssPath.get(cssData.cssPath)
      if (!group) return

      group.cssData = cssData
    },
    addPostData(data: PostData) {
      postData.set(data.cssPath, data)
    },

    getConfig(): CompilerConfig {
      return config
    },

    getEmitConfig(): EmitConfig {
      assert.hasOutPath(config)
      return config
    },

    getMissingCssGroupPaths(): string[] {
      return [...tokenGroups]
        .filter(group => !group.cssPath)
        .map(group => group.groupPath)
    },

    getAllPostData(): PostData[] {
      return postData.values().toArray()
    },

    getCssPaths(): string[] {
      return groupByCssPath.keys().toArray()
    },
    getGroupByTokenPath(tokenPath: string) {
      return groupByTokenPath.get(tokenPath)
    },

    getGroupByCssPath(cssPath: string) {
      return groupByCssPath.get(cssPath)
    },

    getCssDataGroups(): CssDataTokenGroup[] {
      const groups = groupByCssPath.values().toArray()
      assert.groupsHaveCssData(groups)
      return groups
    },

    getCssDataGroupsByPaths(paths: string[]) {
      return this.getCssDataGroups().filter(
        group => paths.includes(group.cssPath)
      )
    }
  }
}