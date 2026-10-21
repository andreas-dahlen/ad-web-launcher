import { enrichTree } from '../normalize/treeNode.ts';
import type { TreeHandlerDeps } from '../types/controller.types.ts';

export type TreeController = NonNullable<ReturnType<typeof createTreeHandler>>
export function createTreeHandler({
  root,
  loadTree,
  treeCache,
  mergeCache,
  native
}: TreeHandlerDeps
) {

  function update(mergeId: string) {
    const total = native.getTotalExclude()
    if (!total) return
    const details = mergeCache.getDetails(mergeId)
    if (!details) return

    const tree = loadTree.build(total)
    const result = enrichTree(tree, root, details.semantics)

    treeCache.setData(mergeId, result)
  }

  function reset() {
    const total = native.getTotalExclude()
    if (!total) return
    const tree = loadTree.build(total)
    const result = enrichTree(tree, root)
    treeCache.setData('inactive', result)
  }

  return {
    update,
    reset
  }
}