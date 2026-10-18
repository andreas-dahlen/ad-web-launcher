import type { TreeCache } from '../cache/treeCache.ts';
import type { Scope } from '../types/core.types.ts';
import type { MergeCache } from '../cache/mergeCache.ts';
import { enrichTree } from '../normalize/treeNode.ts';
// import type { NodeSemantics } from '../types/exclusion.types.ts';

export type TreeController = NonNullable<ReturnType<typeof createTreeHandler>>
export function createTreeHandler(
  { loader, root, appState }: Scope,
  treeCache: TreeCache,
  mergeCache: MergeCache
) {

  function update(mergeId: string) {
    const total = appState.getTotalExclude()
    if (!total) return
    const details = mergeCache.getDetails(mergeId)
    if (!details) return

    const tree = loader.fileTree(total)
    const result = enrichTree(tree, root, details.semantics)

    treeCache.setData(mergeId, result)
  }

  function reset() {
    const total = appState.getTotalExclude()
    if (!total) return
    const tree = loader.fileTree(total)
    const result = enrichTree(tree, root)
    treeCache.setData('inactive', result)
  }

  return {
    update,
    reset
  }
}