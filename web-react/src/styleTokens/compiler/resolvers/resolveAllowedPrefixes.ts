import type { ValidPrefix } from '../../../shared/tokenUtils/compiler.types.ts';
import { prefixPriority } from '../../../shared/tokenUtils/prefixes';
import { createNullIssueCollector, type IssueCollector } from '../state/issueCollector.ts';

const priority = new Map(
  prefixPriority.map((prefix, index) => [prefix, index]),
);

function getPriority(prefix: ValidPrefix): number {
  return priority.get(prefix)!;
}

export function resolveAllowedPrefixes(
  allowed: readonly ValidPrefix[],
  alwaysAllowed: readonly ValidPrefix[],
  exclude: readonly ValidPrefix[],
  collector?: IssueCollector
) {

  const collect = collector ?? createNullIssueCollector()
  collect.setSubject("Prefix Parsing")
  for (const prefix of allowed) {
    if (alwaysAllowed.includes(prefix)) {
      collect.set({ reason: "already in alwaysAllowed", value: prefix })
    }
  }
  for (const prefix of exclude) {
    if (!alwaysAllowed.includes(prefix)) {
      collect.set({ reason: "cannot exclude non-alwaysAllowed prefix", value: prefix })
    }
    if (allowed.includes(prefix)) {
      collect.set({ reason: "exists in both allowed and exclude", value: prefix })
    }
  }

  const effectiveAllowed = [
    ...new Set(
      [...allowed, ...alwaysAllowed]
        .filter(prefix => !exclude.includes(prefix))
    ),
    // eslint-disable-next-line unicorn/no-array-sort
  ].sort((a, b) => getPriority(a) - getPriority(b));

  return {
    effectiveAllowed
  }
}