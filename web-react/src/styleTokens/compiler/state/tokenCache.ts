import type { TokenGroup } from '../resolvers/createTokenGroups.ts';
import type { LoadedToken } from '../loaders/loadToken.ts';

export function createTokenCache(groups: TokenGroup[]) {

  const byGroupPath = new Map<string, TokenGroup>();
  const byTokenPath = new Map<string, LoadedToken>();
  const byCssPath = new Map<string, TokenGroup>();

  function addGroup(group: TokenGroup) {
    byGroupPath.set(group.groupPath, group);
    byCssPath.set(group.cssPath, group);

    for (const token of group.tokens) {
      byTokenPath.set(token.tokenPath, token);
    }
  }

  function removeGroup(groupPath: string) {
    const group = byGroupPath.get(groupPath);

    if (!group) return;

    byGroupPath.delete(groupPath);
    byCssPath.delete(group.cssPath);

    for (const token of group.tokens) {
      byTokenPath.delete(token.tokenPath);
    }
  }

  for (const group of groups) {
    addGroup(group);
  }

  function replaceGroup(group: TokenGroup) {
    removeGroup(group.groupPath);
    addGroup(group);
  }

  return {
    replaceGroup,
    addGroup,
    removeGroup,

    getGroup(path: string) {
      return byGroupPath.get(path);
    },

    getToken(path: string) {
      return byTokenPath.get(path);
    },

    getGroupByCssPath(cssPath: string) {
      return byCssPath.get(cssPath);
    },

    groups() {
      // eslint-disable-next-line unicorn/prefer-iterator-to-array
      return [...byGroupPath.values()];
    },

    tokens() {
      // eslint-disable-next-line unicorn/prefer-iterator-to-array
      return [...byTokenPath.values()];
    },
  };
}
