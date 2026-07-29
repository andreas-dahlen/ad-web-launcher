import type { ValidPrefix } from './compiler.types';
import { prefixPriority } from './prefixes.ts';
import createIssueCollector from './issueCollector.ts';

const priority = new Map(
  prefixPriority.map((prefix, index) => [prefix, index]),
);

function getPriority(prefix: ValidPrefix): number {
  return priority.get(prefix)!;
}

type IssueContext = {
  name: string
  path: string
}

export function resolveAllowedPrefixes(
  allowed: readonly ValidPrefix[],
  alwaysAllowed: readonly ValidPrefix[],
  exclude: readonly ValidPrefix[],
  context?: IssueContext
) {

  const collector = createIssueCollector("prefix",
    context?.name ?? "unknown",
    context?.path ?? "unknown")

  for (const prefix of allowed) {
    if (alwaysAllowed.includes(prefix)) {
      collector.setIssue("already in alwaysAllowed", prefix)
    }
  }
  for (const prefix of exclude) {
    if (!alwaysAllowed.includes(prefix)) {
      collector.setIssue("cannot exclude non-alwaysAllowed prefix", prefix)
    }
    if (allowed.includes(prefix)) {
      collector.setIssue("exists in both allowed and exclude", prefix)
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
    effectiveAllowed,
    issues: collector.flushIssues(),
  }
}