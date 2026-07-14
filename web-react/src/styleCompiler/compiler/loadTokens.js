import fs from "fs";
import path from "path";

function findJsonFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap(entry => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return findJsonFiles(fullPath);
      }

      if (entry.isFile() && entry.name.endsWith(".json")) {
        return [fullPath];
      }

      return [];
    });
}

export default function loadTokens(tokensDir) {
  // const files = fs.readdirSync(tokensDir).filter(f => f.endsWith(".json"));
  const files = findJsonFiles(tokensDir).sort();
  const seenComponents = new Set();

  return files.map(fullPath => {
    // const fullPath = path.join(tokensDir, file);
    const json = JSON.parse(fs.readFileSync(fullPath, "utf8"));

    if (!json.component) {
      throw new Error(`Missing "component" in ${fullPath}`);
    }

    if (json.vars && typeof json.vars !== "object") {
      throw new Error(`❌ "vars" must be an object in ${fullPath}`);
    }

    if (seenComponents.has(json.component)) {
      throw new Error(
        `Duplicate token component "${json.component}" in ${fullPath}`
      )
    }

    seenComponents.add(json.component);


    return {
      name: json.component,
      infix: json.infix ?? json.component,
      alwaysAllowed: Array.isArray(json.alwaysAllowed)
        ? json.alwaysAllowed
        : [],
      vars: Object.entries(json.vars || {}).map(([key, defRaw]) => {
        const def = defRaw || {};

        return {
          key,
          name: typeof def.name === "string" && def.name.trim()
            ? def.name.trim()
            : key,
          allowed: Array.isArray(def.allowed) ? def.allowed : [],
          exclude: Array.isArray(def.exclude) ? def.exclude : [],
          values: def.values || {}
        };
      })
    };
  });
};