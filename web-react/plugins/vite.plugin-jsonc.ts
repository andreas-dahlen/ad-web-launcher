import type { Plugin } from "vite";
import { parse } from "jsonc-parser";

export default function jsoncPlugin(): Plugin {
  return {
    name: "jsonc-loader",

    transform(code, id) {
      if (!id.endsWith(".jsonc")) return;

      const json = parse(code);

      return {
        code: `export default ${JSON.stringify(json)}`,
        map: null,
      };
    },
  };
}