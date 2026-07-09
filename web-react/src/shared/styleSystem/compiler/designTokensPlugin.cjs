// const fs = require("fs");
// const path = require("path");
// const postcss = require("postcss");

// const prefixPriority = ["o", "s", "m", "p", "t", "f"];

// module.exports = (opts = {}) => {
//   const tokensDir = opts.tokensDir || "./src/shared/styleSystem/tokens";

//   return {
//     postcssPlugin: "design-tokens-plugin",

//     Once(root, { result }) {

//       const file = result.opts.from;

//       // Only inject into tokens.module.css
//       if (!file.endsWith("tokens.module.css")) {
//         return;
//       }
//       console.log("🔥 Injecting compiler classes into:", file);

//       const files = fs.readdirSync(tokensDir).filter(f => f.endsWith(".json"));

//       for (const file of files) {
//         const fullPath = path.join(tokensDir, file);
//         const json = JSON.parse(fs.readFileSync(fullPath, "utf8"));

//         const component = json.component;
//         const vars = json.vars || {};
//         const alwaysAllowed = Array.isArray(json.alwaysAllowed)
//           ? json.alwaysAllowed
//           : [];

//         // ⭐ Create a proper PostCSS rule node
//         const compilerRule = postcss.rule({ selector: `.${component}Compiler` });

//         for (const [key, defRaw] of Object.entries(vars)) {
//           const def = defRaw || {};

//           // ⭐ name fallback → use key if name missing
//           const name = typeof def.name === "string" && def.name.trim()
//             ? def.name.trim()
//             : key;

//           // ⭐ allowed fallback → empty array if missing
//           const allowed = Array.isArray(def.allowed)
//             ? def.allowed
//             : [];

//           const values = def.values || {};
//           const baseName = `${component}-${name}`;


//           //
//           // ⭐ 1. Generate var definitions + mapped fallback values
//           //
//           for (const prefix of prefixPriority) {
//             const val = values[prefix];

//             // Skip if prefix not allowed AND not in alwaysAllowed
//             if (!allowed.includes(prefix) && !alwaysAllowed.includes(prefix)) {
//               continue;
//             }

//             // Skip meaningless self-mapping ("f": "f")
//             if (val === prefix) {
//               continue;
//             }

//             // Literal value
//             if (typeof val === "string" && !prefixPriority.includes(val)) {
//               compilerRule.append({
//                 prop: `--${prefix}-${baseName}`,
//                 value: val
//               });
//               continue;
//             }

//             // Prefix → prefix mapping
//             if (prefixPriority.includes(val)) {
//               compilerRule.append({
//                 prop: `--${prefix}-${baseName}`,
//                 value: `var(--${val}-${baseName})`
//               });
//             }
//           }

//           //
//           // ⭐ 2. Generate final fallback chain
//           //
//           const prefixes = [...alwaysAllowed, ...allowed];
//           const sorted = prefixPriority.filter(p => prefixes.includes(p));

//           const chain = sorted.reduceRight(
//             (acc, curr) =>
//               `var(--${curr}-${baseName}${acc ? `, ${acc}` : ""})`,
//             ""
//           );

//           compilerRule.append({
//             prop: `--final-${baseName}`,
//             value: chain
//           });
//         }
//         root.append(compilerRule);
//       }
//     }
//   };
// };

// module.exports.postcss = true;