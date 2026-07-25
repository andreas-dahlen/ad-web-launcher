import type { Root } from 'postcss';
import { toCssVar } from '../../../shared/tokenUtils/stringFormaters.ts';

type Token = {
  infix: string;
  vars: {
    name: string;
  }[];
};

type VariableUsage = {
  missing: string[];
  unused: string[];
};

export default function analyzeVariableUsage(root: Root, token: Token): VariableUsage {
  const declared = new Map<string, string>(
    token.vars.map(variable => {
      const cssVar = toCssVar(
        "final",
        token.infix,
        variable.name
      );

      return [
        cssVar,
        variable.name
      ];
    })
  );
  const prefix = `--final-${token.infix}-`;
  const used = new Set<string>();

  root.walkDecls(decl => {
    for (const match of decl.value.matchAll(
      /var\((--[\w-]+)\s*(?:,[^)]+)?\)/g
    )) {
      const cssVar = match[1];

      if (cssVar.startsWith(prefix)) {
        used.add(cssVar);
      }
    }
  });


  const missing: string[] = [];
  const unused: string[] = [];

  for (const cssVar of used) {
    if (!declared.has(cssVar)) {
      missing.push(cssVar);
    }
  }

  for (const cssVar of declared.keys()) {
    if (!used.has(cssVar)) {
      unused.push(cssVar);
    }
  }

  return {
    missing,
    unused
  };
}