
function toKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
}
type CssVarString = `--${string}`

export function toCssVar(prefix: string, infix: string, suffix: string): CssVarString {

  return `--${toKebab(prefix)}-${toKebab(infix)}-${toKebab(suffix)}`
}