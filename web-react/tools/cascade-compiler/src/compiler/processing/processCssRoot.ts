import type { LoadedCssRoot } from '../../types/compiler.types.ts';
import { loadCssRoot } from '../loaders/loadCssRoot.ts';
import { createIssueCollector } from '../tracking/issueCollector.ts';

export function processCssRoot(
  cssPath: string,
  source?: string
): LoadedCssRoot {
  const collector = createIssueCollector()

  try {
    return {
      root: loadCssRoot(cssPath, source),
      issues: []
    }
  } catch (error) {
    collector.setSubject('Css Root')

    collector.scope({
      value: cssPath,
      path: cssPath,
      context: 'file'
    })

    collector.set({
      reason: error instanceof Error
        ? error.message
        : String(error)
    })

    return {
      root: undefined,
      issues: collector.flush()
    }
  }
}