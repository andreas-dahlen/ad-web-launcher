import type { CssVarString } from '@shared/tokenUtils/compiler.types';
import type { PostData } from '../processPost.ts';
import { assert } from '../../utils/assertions.ts';
import type { Root } from 'postcss';


export function walkProject(
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
  })

  return {
    cssPath,
    variables: [...variables],
    oklchVariables: [...oklchVariables]
  }
}