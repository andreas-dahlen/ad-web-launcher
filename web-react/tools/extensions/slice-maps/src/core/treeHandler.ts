import { enrichTree } from '../normalize/treeNode.ts';
import type { TreeHandlerDeps } from '../types/controller.types.ts';

export type TreeController = NonNullable<ReturnType<typeof createTreeHandler>>
export function createTreeHandler({
  root,
  loadTree,
  treeCache,
  mergeCache
}: TreeHandlerDeps
) {

  function update(mergeId: string) {
    const details = mergeCache.getDetails(mergeId)
    if (!details) return

    const tree = loadTree.build()
    const result = enrichTree(tree, root, details)

    treeCache.setData(mergeId, result)
  }

  function reset() {
    const tree = loadTree.build()
    const result = enrichTree(tree, root)
    treeCache.setData('inactive', result)
  }

  return {
    update,
    reset
  }
}