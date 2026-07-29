import type { CssVarString } from '@shared/tokenUtils/compiler.types';
import { reserved } from '../enums/compiler.ts';

export function toKebab(str: string): string {
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

export function toCamelCase(value: string): string {
  return value
    .replace(/[-_]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^[A-Z]/, char => char.toLowerCase());
}

export function toPascalCase(value: string): string {
  const camel = toCamelCase(value);

  return `${camel.charAt(0).toUpperCase()}${camel.slice(1)}`;
}

export function prefixLeadingNumber(value: string): string {
  if (/^\d/.test(value)) {
    return `_${value}`;
  }
  return value;
}
export function removeInvalidCharacters(value: string): string {
  return value.replace(/[^\p{L}\p{N}_]/gu, "");
}

export function escapeReservedWord(name: string): string {
  if (reserved.has(name)) {
    return `_${name}`;
  }
  return name;
}