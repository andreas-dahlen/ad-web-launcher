import path from "node:path";
import getTokenOwner from "../../../shared/tokenUtils/getTokenOwner.ts";

export default function resolveTokenImportPath(
  file: string,
  outputDir: string
): string {
  const relative = path
    .relative(outputDir, file)
    .replaceAll("\\", "/");

  const tokensIndex = relative.indexOf("tokens/");

  if (tokensIndex === -1) {
    throw new Error(
      `❌ Couldn't determine token import path: ${relative}`
    );
  }

  const tokensPath = relative.slice(
    0,
    tokensIndex + "tokens/".length
  );

  const relativeToTokens = relative.slice(
    tokensIndex + "tokens/".length
  );

  const owner = getTokenOwner(file);

  // Root token: button.json
  if (!relativeToTokens.includes("/")) {
    return `${tokensPath}${owner}.json`;
  }

  // Folder token: slider/slider.json
  return `${tokensPath}${owner}`;
}