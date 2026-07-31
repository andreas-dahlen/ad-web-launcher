import type { ValidPrefix } from './compiler.types.ts';

export function isValidPrefix(
  value: unknown,
): value is ValidPrefix {
  return typeof value === "string" &&
    (prefixPriority).includes(value as ValidPrefix);
}

export const prefixPriority = [
  "o", "s", "m", "p", "t", "f"
] as const satisfies readonly ValidPrefix[]