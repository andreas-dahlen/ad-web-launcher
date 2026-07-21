import path from "node:path";

export default function resolveCssTokenFile(file: string, tokenName: string): string | null {
  const moduleName = path.basename(file);
  const expected = `${tokenName}.module.css`;

  if (
    moduleName.toLowerCase() !== expected.toLowerCase()
  ) {
    return null;
  }

  return file;
}