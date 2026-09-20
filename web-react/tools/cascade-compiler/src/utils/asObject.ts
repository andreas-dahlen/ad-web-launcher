export function asObject(
  value: unknown
): Record<string, unknown> | undefined {
  if (
    value === null ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    return undefined
  }

  return value as Record<string, unknown>
}

export function asArray(
  value: unknown
): unknown[] | undefined {
  if (
    value === null ||
    typeof value === 'object' ||
    !Array.isArray(value)
  ) {
    return undefined
  }

  return value as unknown[]
}