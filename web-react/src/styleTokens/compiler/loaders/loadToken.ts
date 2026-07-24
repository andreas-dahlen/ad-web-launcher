import loadTokenFile from './loadTokenFile.ts';
import validate from '../../validation/validateJson.ts';
import type { RawVarDef } from '../../../shared/tokenUtils/compiler.types.ts'
import { filterValidPrefixes } from '../../../shared/tokenUtils/prefixes.ts';
import { getAllowedPrefixes } from '../../../shared/tokenUtils/getAllowedPrefixes.ts';
import type { LoadedToken } from '../../types/compiler.types.ts'

export default function loadToken(fullPath: string): LoadedToken {
  const { json, errors } = loadTokenFile(fullPath)

  validate.parse(errors, json, fullPath)
  const infix = json.infix ?? json.component;

  const alwaysAllowed = filterValidPrefixes(json.alwaysAllowed)

  return {
    name: json.component,
    tokenPath: fullPath,
    infix,
    alwaysAllowed: alwaysAllowed,
    vars: Object.entries(json.vars ?? {}).map(([key, defRaw]) => {
      const def: RawVarDef = defRaw ?? {};

      validate.variable(key, def, fullPath)

      const variableName =
        typeof def.name === "string" && def.name.trim()
          ? def.name.trim()
          : key;

      const allowed = filterValidPrefixes(def.allowed)
      const exclude = filterValidPrefixes(def.exclude)
      return {
        key,
        name: variableName,
        allowed: allowed,
        exclude: exclude,
        values: def.values || {},
        effectiveAllowed: getAllowedPrefixes(allowed, alwaysAllowed, exclude)
      };
    })
  }
}