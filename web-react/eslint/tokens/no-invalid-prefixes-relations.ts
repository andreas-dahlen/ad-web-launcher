import path from "node:path";
import type { TSESTree, ESLintUtils } from "@typescript-eslint/utils";
import {
  getAlwaysAllowed,
  getVars,
  getArrayProperty,
  getObjectProperty,
  getValueLoc
} from "./helpers/tokenAst.ts";

const rule: ESLintUtils.RuleModule<
  "invalidAllowed" |
  "invalidExclude" |
  "conflict" |
  "invalidValuePrefix" |
  "excludedValuePrefix",
  []
> = {
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
        '"{{prefix}}" is not declared as allowed or alwaysAllowed',

      excludedValuePrefix:
        '"{{prefix}}" cannot be used because it is excluded'
    }
  },

  create(context) {
    const filename = context.filename.split(path.sep).join("/");

    if (!filename.endsWith(".json") && !filename.endsWith(".jsonc")) {
      return {};
    }

    return {
      Program(node: TSESTree.Program) {

        const statement = node.body[0];

        if (
          !statement ||
          statement.type !== "ExpressionStatement"
        ) {
          return;
        }

        const root = statement.expression;

        if (!root || root.type !== "ObjectExpression") return;


        const alwaysAllowed = getAlwaysAllowed(root);
        const vars = getVars(root);

        for (const variable of vars) {
          const allowed = getArrayProperty(variable.value, "allowed");
          const exclude = getArrayProperty(variable.value, "exclude");
          const values = getObjectProperty(variable.value, "values");
          const totalAllowed = [...alwaysAllowed.values, ...allowed.values];

          for (const entry of allowed.entries) {
            const prefix = entry.value;

            if (alwaysAllowed.values.includes(prefix)) {
              context.report({
                loc: getValueLoc(entry.node),
                messageId: "invalidAllowed",
                data: { prefix }
              });
            }
          }

          for (const entry of exclude.entries) {
            const prefix = entry.value

            if (!alwaysAllowed.values.includes(prefix)) {
              context.report({
                loc: getValueLoc(entry.node),
                messageId: "invalidExclude",
                data: { prefix }
              });
            }
            if (allowed.values.includes(prefix)) {
              context.report({
                loc: getValueLoc(entry.node),
                messageId: "conflict",
                data: { prefix }
              });
            }
          }

          for (const entry of values.entries) {
            const prefix = entry.key;

            if (!totalAllowed.includes(prefix)) {
              context.report({
                loc: getValueLoc(entry.node),
                messageId: "invalidValuePrefix",
                data: { prefix }
              });
              continue
            }
            if (exclude.values.includes(prefix)) {
              context.report({
                loc: getValueLoc(entry.node),
                messageId: "excludedValuePrefix",
                data: { prefix }
              });
            }
          }
        }
      }
    };
  }
};

export default rule;