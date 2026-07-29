import type { ValidPrefix } from './compiler.types.ts';

export type Issue = {
  subject: string
  name: string
  property?: string
  reason: string
  path: string
}
export function isValidPrefix(
  value: unknown,
): value is ValidPrefix {
  return typeof value === "string" &&
    (prefixPriority).includes(value as ValidPrefix);
}



export const prefixPriority = [
  "o", "s", "m", "p", "t", "f"
] as const satisfies readonly ValidPrefix[]


export function assertPrefixes(
  values: readonly unknown[] | undefined
): ValidPrefix[] {
  return (values ?? []).map(assertValidPrefix);
}

export function assertValidPrefix(
  value: unknown
): ValidPrefix {
  if (!isValidPrefix(value)) {
    throw new Error(`Invalid prefix "${value}" in JSON`);
  }

  return value;
}