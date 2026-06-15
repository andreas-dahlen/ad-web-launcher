export function merge<T>(base: T, overrides?: Partial<T>): T {
  return {
    ...base,
    ...overrides
  }
}

export const ANY = <T>(v: T): unknown => v