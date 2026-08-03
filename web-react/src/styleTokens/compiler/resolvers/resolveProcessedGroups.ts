import type { CssTokenGroup } from '../../types/compiler.types.ts';
import type { CompilerRun } from '../tracking/compilerRun.ts';
import type { TokenCache } from '../tracking/tokenCache.ts';

export function resolveProcessedGroups(
  cache: TokenCache,
  run: CompilerRun
): CssTokenGroup[] {
  return run.getProcessedGroupPaths()
    .map(groupPath => cache.getGroupByGroupPath(groupPath))
    .filter((group): group is CssTokenGroup => group !== undefined);
}