import type { ValidPrefix } from './compiler.types.ts';
import { constants } from './constants.js';
export function isValidPrefix(
  value: unknown,
): value is ValidPrefix {
  return typeof value === "string" &&
    constants.prefixPriority.includes(value as ValidPrefix);
}