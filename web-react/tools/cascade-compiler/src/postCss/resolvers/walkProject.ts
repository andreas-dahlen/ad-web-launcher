import { createIssueCollector } from '../../diagnostics/issueCollector.ts';
import type { CssVarString } from '../../types/cascade.types.ts';
import type { PostDataResult } from '../../types/compiler.types.ts';
import { assert } from '../../utils/assertions.ts';
import type { Root } from 'postcss';


export function walkProject(
  root: Root,
  cssPath: string
): PostDataResult {
  const collector = createIssueCollector()
  const variables = new Set<CssVarString>();
  const oklchVariables = new Map<CssVarString, string>();

  root.walkDecls(decl => {
    if (!decl.prop.startsWith('--')) {
      return;
    }
    try {
      assert.cssVariable(decl.prop)


      variables.add(decl.prop);

      const value = decl.value.trim();
      if (value.startsWith('oklch(')) {
        oklchVariables.set(decl.prop, value);
      }
    } catch (error) {
      collector.setSubject('Walk project')
      collector.scope({
        value: decl.prop,
        path: cssPath,
        context: 'css variable'
      })
      collector.set({
        reason: error instanceof Error
          ? error.message
          : String(error)
      })
    }
  })

  return {
    postData: {
      cssPath,
      variables: [...variables],
      oklchVariables: [...oklchVariables],
    },
    issues: collector.flush()
  }
}