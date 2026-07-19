import path from "path";

export default function resolveCssModule(file, token) {
  const moduleName = path.basename(file);
  const expected = `${token.name}.module.css`;

  if (
    moduleName.toLowerCase() !== expected.toLowerCase()
  ) {
    return null;
  }

  return file;
}