import { toCssVar } from '../../../shared/compilerUtils/stringFormaters.ts';

export default function resolveVariableUsage(root, token) {
  const declared = new Map(
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
  const used = new Set();

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


  const missing = [];
  const unused = [];

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