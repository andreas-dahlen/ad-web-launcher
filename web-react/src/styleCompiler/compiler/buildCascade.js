import { toCssVar } from '../../shared/compilerUtils/stringFormaters.ts'
import { getAllowedPrefixes } from '../../shared/compilerUtils/getAllowedPrefixes.ts'
import { constants } from '../../shared/compilerUtils/prefixes.ts';
export default function buildCascade(rule, component, variable) {
  const { name, allowed, exclude } = variable;

  const effectiveAllowed = getAllowedPrefixes(allowed, component.alwaysAllowed, exclude)

  const sorted = constants.prefixPriority.filter(p => effectiveAllowed.includes(p));

  const chain = sorted.reduceRight(
    (acc, curr) =>
      `var(${toCssVar(curr, component.infix, name)}${acc ? `, ${acc}` : ""})`,
    ""
  );

  rule.append({
    prop: toCssVar("final", component.infix, name),
    value: chain
  })
}
