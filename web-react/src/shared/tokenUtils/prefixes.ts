import type { ValidPrefix } from './compiler.types.ts';
export function isValidPrefix(
  value: unknown,
): value is ValidPrefix {
  return typeof value === "string" &&
    (prefixPriority).includes(value as ValidPrefix);
}

export function filterValidPrefixes(
  values: readonly unknown[] | undefined,
): ValidPrefix[] {
  return (values ?? []).filter(isValidPrefix);
}

export const prefixPriority = [
  "o", "s", "m", "p", "t", "f"
] as const satisfies readonly ValidPrefix[]



export function assertValidPrefix(
  value: unknown
): ValidPrefix {
  if (!isValidPrefix(value)) {
    throw new Error(`Invalid prefix "${value}" in JSON`);
  }

  return value;
}