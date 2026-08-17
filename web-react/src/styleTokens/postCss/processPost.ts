import type { CssVarString } from '../../shared/tokenUtils/compiler.types.ts';
import { assert } from '../compiler/processing/assertions.ts';
import type { Root } from 'postcss';

export type PostData = {
  cssPath: string;
  variables: CssVarString[];
  oklchVariables: Array<[CssVarString, string]>;
};

export function processPost(
  root: Root,
  cssPath: string,
): PostData {
  const variables = new Set<CssVarString>();
  const oklchVariables = new Map<CssVarString, string>();

  root.walkDecls(decl => {
    if (!decl.prop.startsWith('--')) {
      return;
    }
    assert.cssVariable(decl.prop)

    variables.add(decl.prop);

    const value = decl.value.trim();
    if (value.startsWith('oklch(')) {
      oklchVariables.set(decl.prop, value);
    }
  });

  return {
    cssPath,
    variables: [...variables],
    oklchVariables: [...oklchVariables]
  }
}