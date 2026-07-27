import type { CssTokenGroup } from '../../types/compiler.types';
import type { CompilerRun } from '../state/compilerRun.ts';
import type { TokenCache } from '../state/tokenCache.ts';

export default function resolveProcessedGroups(
  cache: TokenCache,
  run: CompilerRun
): CssTokenGroup[] {
  return run.getProcessedGroupPaths()
    .map(groupPath => cache.getGroupByGroupPath(groupPath))
    .filter((group): group is CssTokenGroup => group !== undefined);
}