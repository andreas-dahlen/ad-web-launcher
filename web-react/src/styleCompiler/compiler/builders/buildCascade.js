import { toCssVar } from '../../../shared/compilerUtils/stringFormaters.ts'
import { getAllowedPrefixes } from '../../../shared/compilerUtils/getAllowedPrefixes.ts'
import { constants } from '../../../shared/compilerUtils/prefixes.ts';
export default function buildCascade(rule, token, variable) {
  const { name, allowed, exclude } = variable;

  const effectiveAllowed = getAllowedPrefixes(allowed, token.alwaysAllowed, exclude)

  const sorted = constants.prefixPriority.filter(p => effectiveAllowed.includes(p));

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
