import type { LoadedToken } from "@styleTokens/compiler/loaders/getToken";
import getTokens from "@styleTokens/compiler/loaders/getTokens";

interface CachedToken {
  tokenPath: string;
  cssPath: string;
  groupPath: string;

  token: LoadedToken;
}

export function createTokenCache() {
  const byTokenPath = new Map<string, CachedToken>();
  const byCssPath = new Map<string, CachedToken[]>();
  const byGroupPath = new Map<string, CachedToken[]>();

  function add(entry: CachedToken) {
    byTokenPath.set(entry.tokenPath, entry);

    const cssEntries = byCssPath.get(entry.cssPath) ?? [];
    cssEntries.push(entry);
    byCssPath.set(entry.cssPath, cssEntries);

    const groupEntries = byGroupPath.get(entry.groupPath) ?? [];
    groupEntries.push(entry);
    byGroupPath.set(entry.groupPath, groupEntries);
  }

  function clear() {
    byTokenPath.clear();
    byCssPath.clear();
    byGroupPath.clear();
  }

  return {
    refreshAll(dir: string) {
      clear();

      for (const token of getTokens(dir)) {
        add({
          tokenPath: token.tokenPath,
          cssPath: "",      // TODO resolve
          groupPath: "",    // TODO resolve
          token,
        });
      }
    },

    get(tokenPath: string) {
      return byTokenPath.get(tokenPath);
    },

    getByCssPath(cssPath: string) {
      return byCssPath.get(cssPath) ?? [];
    },

    values() {
      return byTokenPath.values();
    },
  };
}