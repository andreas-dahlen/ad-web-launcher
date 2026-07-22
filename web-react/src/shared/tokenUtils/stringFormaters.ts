
function toKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
}
type CssVarString = `--${string}`

export function toCssVar(prefix: string, infix: string, suffix: string): CssVarString {

  return `--${toKebab(prefix)}-${toKebab(infix)}-${toKebab(suffix)}`
}

export function toCamelCase(string: string) {
  return `${string.charAt(0).toLowerCase()}${string.slice(1)}`;
}

export function toPascalCase(string: string) {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
}