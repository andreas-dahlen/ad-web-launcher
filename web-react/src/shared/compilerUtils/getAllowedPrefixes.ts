import type { ValidPrefix } from './compiler.types';

export function getAllowedPrefixes(
  allowed: readonly ValidPrefix[],
  alwaysAllowed: readonly ValidPrefix[],
  exclude: readonly ValidPrefix[]
) {
  return [
    ...allowed,
    ...alwaysAllowed
  ].filter(prefix => !exclude.includes(prefix));
}