import { toCssVarPrefix } from '../../oldSharedUtils/stringFormaters.js';
import type { CssVarString } from '../../oldSharedUtils/oldSharedCompiler.types.js';
import type { Rule, Root } from "postcss";
import selectorParser from "postcss-selector-parser";
import { prefixPriority } from '../../oldSharedUtils/prefixes.js';
import type { WalkModuleResult } from '../../types/compiler.types.js';
import { assert } from '../../utils/assertions.js'

const VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function walkModule(
  root: Root,
  infixes: string[]
): WalkModuleResult {
  const expectedRules = new Set(
    infixes.map(infix => `.${infix}`)
  )
  const variablePrefixes = infixes.map(
    infix => toCssVarPrefix("final", infix)
  );

  const declarationPrefixes = prefixPriority
    .flatMap(prefix =>
      infixes.map(infix => `--${prefix}-${infix}`)
    );

  const rules = new Map<string, Rule>()
  const foundSelectors = new Set<string>()
  const usableSelectors = new Set<string>()
  const foundFinalVariables = new Set<CssVarString>()
  const declaredVariables = new Set<CssVarString>();
  const presetResetData = new Map<Rule, Set<CssVarString>>()

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

    if (
      declarationPrefixes.some(prefix =>
        decl.prop.startsWith(prefix)
      )
    ) {
      assert.cssVariable(decl.prop)
      declaredVariables.add(decl.prop);
    }

    const rule = decl.parent;

    if (rule?.type !== "rule") {
      return;
    }

    const isCustomProperty = decl.prop.startsWith("--");

    for (const match of decl.value.matchAll(
      /var\((--[\w-]+)\s*(?:,[^)]+)?\)/g
    )) {
      const cssVar = match[1];

      if (
        variablePrefixes.some(prefix =>
          cssVar.startsWith(prefix)
        )
      ) {
        assert.cssVariable(cssVar)
        foundFinalVariables.add(cssVar);


        if (isCustomProperty) return

        const variables = presetResetData.get(rule) ?? new Set();

        variables.add(cssVar);

        presetResetData.set(rule, variables);
      }
    }
  });

  return {
    rules,
    foundSelectors: [...foundSelectors],
    usableSelectors: [...usableSelectors],
    foundFinalVariables: [...foundFinalVariables],
    declaredVariables: [...declaredVariables],
    presetResetData: [...presetResetData]
  }
}