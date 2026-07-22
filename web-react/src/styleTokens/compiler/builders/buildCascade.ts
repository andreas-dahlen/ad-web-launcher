import { toCssVar } from '../../../shared/tokenUtils/stringFormaters.ts'
import { getAllowedPrefixes } from '../../../shared/tokenUtils/getAllowedPrefixes.ts'
import { prefixPriority } from '../../../shared/tokenUtils/prefixes.ts';
import type { ValidPrefix } from '../../../shared/tokenUtils/compiler.types.ts';
import type { Rule } from 'postcss';

type Token = {
  infix: string;
  alwaysAllowed: readonly ValidPrefix[];
};

type Variable = {
  name: string;
  allowed: readonly ValidPrefix[];
  exclude: readonly ValidPrefix[];
};
export default function buildCascade(
  rule: Rule,
  token: Token,
  variable: Variable) {
  const { name, allowed, exclude } = variable;

  const effectiveAllowed = getAllowedPrefixes(allowed, token.alwaysAllowed, exclude)

  const sorted = prefixPriority.filter(p => effectiveAllowed.includes(p));

  const chain = sorted.reduceRight(
    (acc, curr) =>
      `var(${toCssVar(curr, token.infix, name)}${acc ? `, ${acc}` : ""})`,
    ""
  );

  rule.append({
    prop: toCssVar("final", token.infix, name),
    value: chain
  })
}
