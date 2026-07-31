import { toCssVarPrefix } from '../../../shared/tokenUtils/stringFormaters.ts';
import type { CssVarString } from '../../../shared/tokenUtils/compiler.types.ts';
import type { Root, Rule } from "postcss";
import selectorParser from "postcss-selector-parser";

type WalkModuleResult = {
  rules: Map<string, Rule>
  foundSelectors: string[]
  usableSelectors: string[]
  foundVariables: CssVarString[]
};
const VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export default function walkModule(
  root: Root,
  infixes: string[]
): WalkModuleResult {
  const expectedRules = new Set(
    infixes.map(infix => `.${infix}`)
  )
  const variablePrefixes = infixes.map(
    infix => toCssVarPrefix("final", infix)
  );

  const rules = new Map<string, Rule>()
  const foundSelectors = new Set<string>()
  const usableSelectors = new Set<string>()
  const foundVariables = new Set<CssVarString>()

  root.walkRules(rule => {
    selectorParser(selectors => {
      selectors.walkClasses(node => {
        const selector = node.value;

        foundSelectors.add(selector);

        if (VALID_IDENTIFIER.test(selector)) {
          usableSelectors.add(selector);
        }
      });
    }).processSync(rule.selector);

    if (expectedRules.has(rule.selector)) {
      rules.set(rule.selector, rule);
    }
  })


  root.walkDecls(decl => {
    for (const match of decl.value.matchAll(
      /var\((--[\w-]+)\s*(?:,[^)]+)?\)/g
    )) {
      const cssVar = match[1];

      if (
        variablePrefixes.some(prefix =>
          cssVar.startsWith(prefix)
        )
      ) {
        foundVariables.add(cssVar as CssVarString);
      }
    }
  });

  return {
    rules,
    foundSelectors: [...foundSelectors],
    usableSelectors: [...usableSelectors],
    foundVariables: [...foundVariables]
  }
}