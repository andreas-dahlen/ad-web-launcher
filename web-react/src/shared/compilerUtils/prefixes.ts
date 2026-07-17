import type { ValidPrefix } from './compiler.types.ts';
export function isValidPrefix(
  value: unknown,
): value is ValidPrefix {
  return typeof value === "string" &&
    constants.prefixPriority.includes(value as ValidPrefix);
}

export const constants = {
  prefixPriority: ["o", "s", "m", "p", "t", "f"]
}