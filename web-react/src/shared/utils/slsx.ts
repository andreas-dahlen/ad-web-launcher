// type StyleValue =
//   | string
//   | number
//   | null
//   | undefined

// type StyleState = Record<string, StyleValue>

type StyleString = `--${string}`
// type StyleVarsResult = Record<StyleString, string>

function toKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
}

function toStyleVar(key: string): StyleString {
  const kebab = toKebab(key)
  return kebab.startsWith('--') ? kebab as StyleString : `--${kebab}`
}

/** converts object into css variable style object */
export function stsx<T extends Record<string, string | number>>(
  vars: Partial<T>,
  map: Record<string, string>
) {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(vars)) {
    if (value == null || key == null) continue

    if (map && map[key]) {
      result[map[key]] = String(value)
      continue
    }

    const cssVar = toStyleVar(key)
    result[cssVar] = String(value)
  }

  return result
}
