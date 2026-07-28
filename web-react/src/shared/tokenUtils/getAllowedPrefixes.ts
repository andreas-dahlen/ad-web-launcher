import type { ValidPrefix } from './compiler.types';
import { prefixPriority } from '../../shared/tokenUtils/prefixes.ts';

const priority = new Map(
  prefixPriority.map((prefix, index) => [prefix, index]),
);

function getPriority(prefix: ValidPrefix): number {
  return priority.get(prefix)!;
}

export function getAllowedPrefixes(
  allowed: readonly ValidPrefix[],
  alwaysAllowed: readonly ValidPrefix[],
  exclude: readonly ValidPrefix[]
) {
  return [...allowed, ...alwaysAllowed]
    .filter(prefix => !exclude.includes(prefix))
    // eslint-disable-next-line unicorn/no-array-sort
    .sort(
      (a, b) => getPriority(a) - getPriority(b)!,
    );
}