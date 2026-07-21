import path from "node:path";
import resolveTokenOwnerName from "../../../shared/compilerUtils/resolveTokenOwnerName.ts";

export default function resolveTokenImportPath(
  file,
  outputDir
) {
  let relative = path
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

  const owner = resolveTokenOwnerName(file);

  return `${tokensPath}${owner}`;
}