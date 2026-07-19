import path from "node:path";
import loadTokenFile from "../../../src/styleCompiler/loaders/loadTokenFile.js";

export default {
  meta: {
    type: "problem",
    docs: {
      description: "Validate token prefix relationships"
    },
    schema: [],
    messages: {
      invalidAllowed:
        '"{{prefix}}" is already part of alwaysAllowed',

      invalidExclude:
        '"{{prefix}}" cannot be excluded because it is not alwaysAllowed',

      conflict:
        '"{{prefix}}" cannot exist in both allowed and exclude',

      invalidValuePrefix:
        '"{{prefix}}" is not declared as allowed or alwaysAllowed'
    }
  },

  create(context) {
    const filename = context.filename.split(path.sep).join("/");

    if (!filename.endsWith(".json") && !filename.endsWith(".jsonc")) {
      return {};
    }

    // if (!filename.includes("/styleCompiler/tokens/")) {
    //   return {};
    // }

    const { json } = loadTokenFile(filename);

    return {
      Program(node) {
        const token = json

        const baseline = token.alwaysAllowed ?? [];

        for (const variable of Object.values(token.vars ?? {})) {

          const allowed = variable.allowed ?? [];
          const exclude = variable.exclude ?? [];
          const values = variable.values ?? {};

          for (const prefix of allowed) {

            if (baseline.includes(prefix)) {
              context.report({
                node,
                messageId: "invalidAllowed",
                data: {
                  prefix
                }
              });
            }
          }

          for (const prefix of exclude) {

            if (!baseline.includes(prefix)) {
              context.report({
                node,
                messageId: "invalidExclude",
                data: {
                  prefix
                }
              });
            }

            if (allowed.includes(prefix)) {
              context.report({
                node,
                messageId: "conflict",
                data: {
                  prefix
                }
              });
            }
          }


          const availablePrefixes = [
            ...baseline,
            ...allowed
          ].filter(
            prefix => !exclude.includes(prefix)
          );


          for (const prefix of Object.keys(values)) {

            if (!availablePrefixes.includes(prefix)) {
              context.report({
                node,
                messageId: "invalidValuePrefix",
                data: {
                  prefix
                }
              });
            }

          }
        }
      }
    };
  }
};