

export function resolveTokenGroupPath(
  tokenPath: string
): string {
  const normalized = tokenPath.replaceAll("\\", "/").replaceAll(/\/+/g, "/");

  const tokensIndex = normalized.indexOf("tokens/");

  if (tokensIndex === -1) {
    throw new Error(`Invalid token path: ${tokenPath}`);
  }

  const afterTokens = normalized.slice(
    tokensIndex + "tokens/".length
  );

  const parts = afterTokens.split("/");

  // tokens/button.json
  if (parts.length === 1) {
    return normalized
  }

  // tokens/slider/thumb.json
  const lastSlash = normalized.lastIndexOf("/");

  return normalized.slice(0, lastSlash);
}