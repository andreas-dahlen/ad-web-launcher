export function normalizeCssValue(value: unknown): string {
  return String(value).trim().replace(/;\s*$/, "");
}

export function normalizeCssName(value: string): string {
  return value.trim();
}