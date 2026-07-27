import type { CssVarString } from '@shared/tokenUtils/compiler.types';

function toKebab(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
}

export function toCssVar(prefix: string, infix: string, suffix: string): CssVarString {

  return `--${toKebab(prefix)}-${toKebab(infix)}-${toKebab(suffix)}`
}

export function toCssVarPrefix(prefix: string, infix: string): CssVarString {
  return `--${toKebab(prefix)}-${toKebab(infix)}-`;
}

export function toCamelCase(string: string) {
  return `${string.charAt(0).toLowerCase()}${string.slice(1)}`;
}

export function toPascalCase(string: string) {
  return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
}