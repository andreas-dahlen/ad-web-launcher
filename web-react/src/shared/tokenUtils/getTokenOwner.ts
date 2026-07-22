export default function getTokenOwner(tokenPath: string) {
  const normalized = tokenPath.replaceAll("\\", "/");

  const tokensIndex = normalized.indexOf("tokens/");

  if (tokensIndex === -1) {
    throw new Error(
      `❌ Couldn't determine token owner: ${tokenPath}`
    );
  }

  const afterTokens = normalized.slice(
    tokensIndex + "tokens/".length
  );

  const [first, second] = afterTokens.split("/", 2);

  if (!first) {
    throw new Error(`❌ Invalid token path: ${tokenPath}`);
  }

  if (!second) {
    return first.replace(/\.(json|jsonc)$/i, "");
  }

  return first;
}