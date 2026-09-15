import type { Rule } from 'postcss';
import type { CompilerToken, CompilerVariable } from '../../types/compiler.types.ts'
import { toCssVar } from '../../utils/stringFormaters.ts';

export function injectCascade(
  rule: Rule,
  token: CompilerToken,
  variable: CompilerVariable) {
  const { cssName, effectiveAllowed } = variable;

  const chain = effectiveAllowed.reduceRight(
    (acc, prefix) =>
      `var(${toCssVar(prefix, token.infix, cssName)}${acc ? `, ${acc}` : ""})`,
    ""
  );

  rule.append({
    prop: toCssVar("final", token.infix, cssName),
    value: chain
  })
}
