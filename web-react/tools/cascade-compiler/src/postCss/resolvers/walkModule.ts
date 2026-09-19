import { toCssVarPrefix } from '../../utils/stringFormaters.ts';
import type { Rule, Root } from "postcss";
import selectorParser from "postcss-selector-parser";
import type { WalkModuleResult } from '../../types/compiler.types.ts';
import { assert } from '../../utils/assertions.ts'
import { prefixPriority } from '../../utils/prefix.ts';
import type { CssVarString } from '../../types/cascade.types.ts';
import { createIssueCollector } from '../../compiler/tracking/issueCollector.ts';

const VALID_IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function walkModule(
  root: Root,
  infixes: string[]
): WalkModuleResult {

  const collector = createIssueCollector()

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
      try {

        assert.cssVariable(decl.prop)
        declaredVariables.add(decl.prop);
      } catch (error) {
        collector.setSubject('Walk module')
        collector.scope({
          value: decl.prop,
          path: decl.source?.input.file ?? decl.source?.input.document ?? "unknown",
          context: 'css variable'
        })
        collector.set({
          reason: error instanceof Error
            ? error.message
            : String(error)
        })
      }
    }

    const rule = decl.parent;

    if (rule?.type !== "rule") {
      return;
    }

    const isCustomProperty = decl.prop.startsWith("--");

    for (const match of decl.value.matchAll(
      /var\((--[\w-]+)\s*(?:,[^)]+)?\)/g,
    )) {
      const cssVar = match[1];

      if (variablePrefixes.every(prefix => !cssVar.startsWith(prefix))) {
        continue;
      }
      try {

        assert.cssVariable(cssVar);
        foundFinalVariables.add(cssVar);

        if (isCustomProperty) {
          return;
        }

        const variables = presetResetData.get(rule) ?? new Set();

        variables.add(cssVar);
        presetResetData.set(rule, variables);
      } catch (error) {
        collector.setSubject('Walk module')
        collector.scope({
          value: cssVar,
          path: decl.source?.input.file ?? decl.source?.input.document ?? "unknown",
          context: 'css variable'
        })
        collector.set({
          reason: error instanceof Error
            ? error.message
            : String(error)
        })
      }
    }
  });

  return {
    rules,
    foundSelectors: [...foundSelectors],
    usableSelectors: [...usableSelectors],
    foundFinalVariables: [...foundFinalVariables],
    declaredVariables: [...declaredVariables],
    presetResetData: [...presetResetData],
    issues: collector.flush()
  }
}