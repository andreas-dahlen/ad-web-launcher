import { reserved } from './reservedList.js';
export function toKebab(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();
}
export function toCssVar(prefix, infix, suffix) {
    return `--${toKebab(prefix)}-${toKebab(infix)}-${toKebab(suffix)}`;
}
export function toCssVarPrefix(prefix, infix) {
    return `--${toKebab(prefix)}-${toKebab(infix)}-`;
}
export function toPascalCase(value) {
    const camel = toCamelCase(value);
    return `${camel.charAt(0).toUpperCase()}${camel.slice(1)}`;
}
export function toCamelCase(value) {
    return value
        .replace(/[-_]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^[A-Z]/, char => char.toLowerCase());
}
export function removeInvalidCharacters(value) {
    return value.replace(/[^\p{L}\p{N}_]/gu, "");
}
export function prefixLeadingNumber(value) {
    if (/^\d/.test(value)) {
        return `_${value}`;
    }
    return value;
}
export function escapeReservedWord(name) {
    if (reserved.has(name)) {
        return `_${name}`;
    }
    return name;
}
export function normalizeCssValue(value) {
    return String(value).trim().replace(/;\s*$/, "");
}
export function removeWhitespace(value) {
    return value.replace(/\s+/g, "");
}
