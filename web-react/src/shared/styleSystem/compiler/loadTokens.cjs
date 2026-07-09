const fs = require("fs");
const path = require("path");

module.exports = function loadTokens(tokensDir) {
  const files = fs.readdirSync(tokensDir).filter(f => f.endsWith(".json"));

  return files.map(file => {
    const fullPath = path.join(tokensDir, file);
    const json = JSON.parse(fs.readFileSync(fullPath, "utf8"));

    if (!json.component) {
      throw new Error(`Missing "component" in ${file}`);
    }

    if (json.vars && typeof json.vars !== "object") {
      throw new Error(`❌ "vars" must be an object in ${file}`);
    }

    return {
      name: json.component,
      inFix: json.inFix ?? json.component,
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
          values: def.values || {}
        };
      })
    };
  });
};