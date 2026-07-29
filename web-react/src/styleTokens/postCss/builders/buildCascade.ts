import { toCssVar } from '../../../shared/tokenUtils/stringFormaters.ts'
import type { Rule } from 'postcss';
import type { LoadedToken, LoadedVariable } from '@styleTokens/types/compiler.types.ts';

export default function buildCascade(
  rule: Rule,
  token: LoadedToken,
  variable: LoadedVariable) {
  const { name, effectiveAllowed } = variable;

  const chain = effectiveAllowed.reduceRight(
    (acc, curr) =>
      `var(${toCssVar(curr, token.infix, name)}${acc ? `, ${acc}` : ""})`,
    ""
  );

  rule.append({
    prop: toCssVar("final", token.infix, name),
    value: chain
  })
}
