import fs from "fs";
import { parse } from 'jsonc-parser'
import validate from './validation/validateJson.js';
import { findTokenFiles } from '../loaders/findTokenFiles.js';
import loadTokenFile from '../loaders/loadTokenFile.js';

export default function loadTokens(tokensDir) {
  // const files = fs.readdirSync(tokensDir).filter(f => f.endsWith(".json"));
  const files = findTokenFiles(tokensDir)
  const seenVariables = new Map();

  return files.map(fullPath => {

    const { json, errors } = loadTokenFile(fullPath)

    validate.parse(errors, json, fullPath)

    const infix = json.infix ?? json.component;

    return {
      name: json.component,
      file: fullPath,
      infix: infix,
      alwaysAllowed: Array.isArray(json.alwaysAllowed)
        ? json.alwaysAllowed
        : [],
      vars: Object.entries(json.vars || {}).map(([key, defRaw]) => {

        const def = defRaw || {};

        validate.variable(key, def, fullPath)

        const variableName = typeof def.name === "string" && def.name.trim()
          ? def.name.trim()
          : key

        const identity = `${json.component}:${infix}:${variableName}`;

        if (seenVariables.has(identity)) {
          const previous = seenVariables.get(identity);
          validate.duplicates(previous, identity, fullPath)
        }

        seenVariables.set(identity, {
          fullPath
        })

        return {
          key,
          name: variableName,
          allowed: Array.isArray(def.allowed) ? def.allowed : [],
          exclude: Array.isArray(def.exclude) ? def.exclude : [],
          values: def.values || {}
        };
      })
    };
  });
};