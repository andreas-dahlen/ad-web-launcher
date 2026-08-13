import type { CssVarString } from '../../shared/tokenUtils/compiler.types.ts';
import { assert } from '../compiler/processing/assertions.ts';
import type { Root } from 'postcss';

export type PostData = {
  cssPath: string;
  variables: CssVarString[];
};

export function processPost(
  root: Root,
  cssPath: string,
): PostData {
  const variables = new Set<CssVarString>();

  root.walkDecls(decl => {
    if (!decl.prop.startsWith('--')) {
      return;
    }
    assert.cssVariable(decl.prop)
    variables.add(decl.prop);
  });

  return {
    cssPath,
    variables: [...variables]
  }
}