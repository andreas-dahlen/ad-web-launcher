import loadTokenFile from './loadTokenFile.ts';
import validate from '../compiler/validation/validateJson.ts';
import type { RawVarDef, ValidPrefix } from '@shared/compilerUtils/compiler.types.ts';
import { toValidPrefixes } from '@shared/compilerUtils/prefixes.ts';

export type LoadedVariable = {
  key: string;
  name: string;
  allowed: ValidPrefix[];
  exclude: ValidPrefix[];
  values: Partial<Record<ValidPrefix, string>>;
};

export type LoadedToken = {
  name: string;
  file: string;
  infix: string;
  alwaysAllowed: ValidPrefix[];
  vars: LoadedVariable[];
};

export default function loadToken(fullPath: string): LoadedToken {
  const { json, errors } = loadTokenFile(fullPath)

  validate.parse(errors, json, fullPath)

  const infix = json.infix ?? json.component;

  return {
    name: json.component,
    file: fullPath,
    infix,
    alwaysAllowed: toValidPrefixes(json.alwaysAllowed),
    vars: Object.entries(json.vars ?? {}).map(([key, defRaw]) => {
      const def: RawVarDef = defRaw ?? {};

      validate.variable(key, def, fullPath)

      const variableName =
        typeof def.name === "string" && def.name.trim()
          ? def.name.trim()
          : key;

      return {
        key,
        name: variableName,
        allowed: toValidPrefixes(def.allowed),
        exclude: toValidPrefixes(def.exclude),
        values: def.values || {}
      };
    })
  }
}