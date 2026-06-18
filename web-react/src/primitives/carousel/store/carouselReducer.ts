import type { Direction } from '@typing/core.types'

type NodeMap = [
  { nodeIdx: 0, sceneIdx: number },
  { nodeIdx: 1, sceneIdx: number },
  { nodeIdx: 2, sceneIdx: number },
]

type CarouselNodesState = {
  nodes: NodeMap
  currentNode: 0 | 1 | 2
}

type CommitAction = {
  type: 'commit'
  direction: Direction
  total: number
}

function reducer(state: CarouselNodesState, action: CommitAction): CarouselNodesState {
  const { currentNode, nodes } = state
  const isNext = action.direction.dir === 'right' || action.direction.dir === 'down'

  const staleNode = isNext
    ? ((currentNode + 2) % 3) as 0 | 1 | 2
    : ((currentNode + 1) % 3) as 0 | 1 | 2

  const newCurrentNode = isNext
    ? ((currentNode + 1) % 3) as 0 | 1 | 2
    : ((currentNode + 2) % 3) as 0 | 1 | 2

  const newSceneIdx = isNext
    ? (nodes[staleNode].sceneIdx + 3) % action.total
    : (nodes[staleNode].sceneIdx - 3 + action.total) % action.total

  const newNodes = nodes.map(n =>
    n.nodeIdx === staleNode
      ? { ...n, sceneIdx: newSceneIdx }
      : n
  ) as NodeMap

  return { nodes: newNodes, currentNode: newCurrentNode }
}