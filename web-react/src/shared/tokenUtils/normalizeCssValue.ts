export function normalizeCssValue(value: unknown): string {
  return String(value).trim().replace(/;\s*$/, "");
}