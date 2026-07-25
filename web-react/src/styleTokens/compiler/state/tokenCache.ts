import type { TokenGroup } from '../../types/compiler.types.ts';

export type TokenCache = ReturnType<typeof createTokenCache>;

// In-memory compiler snapshot.
// Built from token sources at startup and updated when token files change.
export function createTokenCache(initialGroups: TokenGroup[]) {
  const groups = new Set<TokenGroup>();

  const groupByTokenPath = new Map<string, TokenGroup>();
  const groupByCssPath = new Map<string, TokenGroup>();

  function addGroup(group: TokenGroup) {
    groups.add(group);

    if (group.cssPath) {
      groupByCssPath.set(group.cssPath, group);
    }

    for (const token of group.tokens) {
      groupByTokenPath.set(token.tokenPath, group);
    }
  }

  function removeGroup(group: TokenGroup) {
    groups.delete(group);

    if (group.cssPath) {
      groupByCssPath.delete(group.cssPath);
    }

    for (const token of group.tokens) {
      groupByTokenPath.delete(token.tokenPath);
    }
  }

  for (const group of initialGroups) {
    addGroup(group);
  }

  function cssPaths(): string[] {
    return [...groups]
      .map(group => group.cssPath)
      .filter((path): path is string => path !== undefined);
  }

  function updateGroup(
    group: TokenGroup,
    data: Partial<TokenGroup>,
  ) {
    Object.assign(group, data);
  }

  return {
    addGroup,
    removeGroup,
    cssPaths,
    updateGroup,

    getGroupByTokenPath(tokenPath: string) {
      return groupByTokenPath.get(tokenPath);
    },

    getGroupByCssPath(cssPath: string) {
      return groupByCssPath.get(cssPath);
    },

    groups() {
      return [...groups];
    },
  };
}