import fs from "fs";
import path from "path";
import { parse } from 'jsonc-parser'
// import { toCssVar } from '../../shared/compilerUtils/stringFormaters.ts';
// import log from './consoleLog.js';
import validate from './validateJson.js';

function findJsonFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return findJsonFiles(fullPath);
      }

      if (entry.isFile() &&
        (entry.name.endsWith(".json") ||
          entry.name.endsWith(".jsonc"))
      ) {
        return [fullPath];
      }

      return [];
    });
}

export default function loadTokens(tokensDir) {
  // const files = fs.readdirSync(tokensDir).filter(f => f.endsWith(".json"));
  const files = findJsonFiles(tokensDir).sort();
  const seenVariables = new Map();

  return files.map(fullPath => {

    // const json = JSON.parse(fs.readFileSync(fullPath, "utf8"));
    const text = fs.readFileSync(fullPath, "utf8");

    const errors = []
    const json = parse(text, errors)

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