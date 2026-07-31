import type { TokenGroup } from '../../types/compiler.types.ts';

export type TokenCache = ReturnType<typeof createTokenCache>;

// In-memory compiler snapshot.
// Built from token sources at startup and updated when token files change.
export function createTokenCache(initialGroups: TokenGroup[]) {
  const groups = new Set<TokenGroup>();

  const groupByTokenPath = new Map<string, TokenGroup>();
  const groupByCssPath = new Map<string, TokenGroup>();
  const groupByGroupPath = new Map<string, TokenGroup>();

  function addGroup(group: TokenGroup) {
    groups.add(group);
    groupByGroupPath.set(group.groupPath, group)

    if (group.cssPath) {
      groupByCssPath.set(group.cssPath, group);
    }

    for (const token of group.tokens) {
      groupByTokenPath.set(token.tokenPath, group);
    }
  }

  function removeGroup(group: TokenGroup) {
    groups.delete(group);
    groupByGroupPath.delete(group.groupPath)

    if (group.cssPath) {
      groupByCssPath.delete(group.cssPath);
    }

    for (const token of group.tokens) {
      groupByTokenPath.delete(token.tokenPath);
    }

  }

  function getCssPaths(): string[] {
    // eslint-disable-next-line unicorn/prefer-iterator-to-array
    return [...groupByCssPath.keys()]
  }

  function getMissingCssGroupPaths(): string[] {
    return [...groups]
      .filter(group => !group.cssPath)
      .map(group => group.groupPath);
  }

  for (const group of initialGroups) {
    addGroup(group);
  }

  return {
    addGroup,
    removeGroup,
    getCssPaths,
    getMissingCssGroupPaths,

    getGroupByTokenPath(tokenPath: string) {
      return groupByTokenPath.get(tokenPath);
    },

    getGroupByCssPath(cssPath: string) {
      return groupByCssPath.get(cssPath);
    },

    getGroupByGroupPath(groupPath: string) {
      return groupByGroupPath.get(groupPath)
    },

    getGroups() {
      return [...groups];
    },
  };
}