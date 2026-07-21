import type { ValidPrefix } from '@shared/compilerUtils/compiler.types';
import { isValidPrefix } from '@shared/compilerUtils/prefixes';

export function isValidVarDefinition(
  prefix: ValidPrefix,
  effectiveAllowed: readonly ValidPrefix[],
  value: unknown,
): boolean {
  if (!effectiveAllowed.includes(prefix)) return false;

  if (value === prefix) return false;

  if (typeof value === "string" && !isValidPrefix(value)) {
    return true;
  }

  if (isValidPrefix(value)) {
    return effectiveAllowed.includes(value);
  }

  return false;
}