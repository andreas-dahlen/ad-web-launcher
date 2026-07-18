import path from "path";

export default function resolveCssModule(file, component) {
  const moduleName = path.basename(file);
  const expected = `${component.name}.module.css`;

  if (
    moduleName.toLowerCase() !== expected.toLowerCase()
  ) {
    return null;
  }

  return file;
}