import type { TokenCache } from '@styleTokens/compiler/state/tokenCache';

export default function createReportContext(
  cache: TokenCache
) {
  const expectedTokens = new Set<string>();
  const expectedCss = new Set<string>();

  for (const group of cache.groups()) {
    if (group.cssPath) {
      expectedCss.add(group.cssPath);
    }

    for (const token of group.tokens) {
      expectedTokens.add(token.name);
    }
  }

  return {
    expectedTokens,
    expectedCss,
  };
}