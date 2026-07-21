import loadTokenFile from './loadTokenFile.ts';
import validate from '../compiler/validation/validateJson.js';
export default function loadToken(fullPath) {
  const { json, errors } = loadTokenFile(fullPath)

  validate.parse(errors, json, fullPath)

  const infix = json.infix ?? json.component;

  return {
    name: json.component,
    file: fullPath,
    infix,
    alwaysAllowed: Array.isArray(json.alwaysAllowed)
      ? json.alwaysAllowed
      : [],
    vars: Object.entries(json.vars || {}).map(([key, defRaw]) => {
      const def = defRaw || {};

      validate.variable(key, def, fullPath)

      const variableName =
        typeof def.name === "string" && def.name.trim()
          ? def.name.trim()
          : key;

      return {
        key,
        name: variableName,
        allowed: Array.isArray(def.allowed)
          ? def.allowed
          : [],
        exclude: Array.isArray(def.exclude)
          ? def.exclude
          : [],
        values: def.values || {}
      };
    })
  }
}