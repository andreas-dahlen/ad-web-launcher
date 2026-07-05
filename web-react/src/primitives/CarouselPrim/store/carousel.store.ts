import { immer } from "zustand/middleware/immer"
import { create } from 'zustand'
import type { AxisDirection, Size2D } from '../../../shared/typing/core.types'
import type { StoreLayout } from '@typing/store.types'
import type { CarouselAction } from '@interaction/types/runtime/action.types'
import { assertNever } from '@utils/assertions'
export type NodeId = 0 | 1 | 2

export type Node = {
  nodeId: NodeId
  sceneIdx: number
}

export type NodeBindings = {
  nodes: [Node, Node, Node]
  currentNode: NodeId
}

export type CarouselBinding = {

  //react motion
  liveOffset: number

  //reactScenes
  nodeBindings: NodeBindings
  count: number
  layout: StoreLayout
  dragging: boolean

  //read only... not used by react

  settling: boolean
  pendingDir: AxisDirection | null
}

export type CarouselStore = {
  bindings: Record<string, CarouselBinding>
  init: (id: string, fallback: CarouselBinding) => void
  get: (id: string) => Readonly<CarouselBinding>
  delete: (id: string) => void

  setCount: (id: string, count: number) => void

  setLayout: (id: string, packet: StoreLayout) => void

  setContainerSize: (id: string, size: Size2D) => void

  setItemSize: (id: string, size: Size2D) => void

  getCurrentScene: (id: string) => number | undefined

  purgeScene: (id: string, index: number) => void

  setSettling: (id: string) => void

  apply: (id: string, action: CarouselAction) => void
}

export const carouselStore = create<CarouselStore>()(
  immer((set, get) => ({

    bindings: {},

    init: (id, fallback) => {
      if (get().bindings[id]) return

      set(state => {
        state.bindings[id] = fallback
      })
    },

    get: (id) => {
      return get().bindings[id]
    },

    delete: (id: string) => {
      set(state => {
        delete state.bindings[id]
      })
    },

    setCount: (id, count) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.count = Math.max(0, count)
      })
    },

    setLayout(id, packet) {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.layout = {
          containerSize: packet.containerSize,
          itemSize: packet.itemSize,
        }
      })
    }, //TODO delete this function



    setContainerSize(id, size) {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.layout.itemSize = size
      })
    },
    setItemSize(id, size) {
      set(state => {
        const s = state.bindings[id]
        if (!s) return
        s.layout.containerSize = size

      })
    },

    getCurrentScene(id) {
      const s = get().bindings[id]
      if (!s) return
      const { nodes, currentNode } = s.nodeBindings
      return nodes[currentNode].sceneIdx
    },

    purgeScene: (id, targetSceneIdx) => {
      set(state => {
        const s = state.bindings[id]
        if (!s || s.count === 0) return

        const currentActiveScene = s.nodeBindings.nodes[s.nodeBindings.currentNode].sceneIdx

        // 1. Decrement the scene inventory count safely
        s.count = Math.max(0, s.count - 1)

        // Edge case: If there are no scenes left, reset everything cleanly
        // if (s.count === 0) {
        //   s.nodeBindings.nodes.forEach((node, i) => {
        //     node.sceneIdx = i
        //   })
        //   s.nodeBindings.currentNode = 0
        //   s.liveOffset = 0
        //   return
        // }

        // 2. If we deleted the active scene, or a scene before it, correct the active view
        if (targetSceneIdx <= currentActiveScene) {
          // Commit to previous node pointers structurally
          applyPreviousCommit(s)
        } else {
          // If a scene ahead was deleted, the current node index stays safe, 
          // but we must re-clamp and adjust the forward buffer node index.
          // revalidateBufferBoundaries(s)
        }
      })
    },




    /**
 * Commits pendingDir → index immediately after the swipe animation completes.
 * Without this, index only updates on the next swipeStart — fine visually,
 * but unreliable for anything that needs to know which scene is current.
 * Called from onTransitionEnd in useCarouselMotion.
 */
    setSettling: (id) => {
      set(state => {
        const s = state.bindings[id]
        if (!s?.pendingDir) return
        s.settling = true

        applyCommit(s)

        s.liveOffset = 0
        s.pendingDir = null
      })
      requestAnimationFrame(() => {
        set(state => {
          const s = state.bindings[id]
          if (!s) return
          s.settling = false
        })
      })
    },

    apply: (id, action) => {
      set(state => {
        const s = state.bindings[id]
        if (!s) return

        switch (action.event) {
          case 'swipeStart': {
            s.dragging = true
            s.settling = false

            //cleanup safety
            if (s.pendingDir !== null) {
              console.warn("technically pendingDir cleanup should never happen")
              // applyCommit(s)
              s.liveOffset = 0
              s.pendingDir = null
            }
            break
          }
          case 'swipe': {
            s.liveOffset = action.payload.delta1D
            break
          }
          case 'swipeCommit': {
            if (s.settling) return
            s.pendingDir = action.payload.direction
            s.liveOffset = action.payload.delta1D
            s.dragging = false
            break
          }
          case 'swipeRevert': {
            s.liveOffset = 0
            s.dragging = false
            s.pendingDir = null
            break
          }
          default: assertNever(action)
        }
      })
    }
  }))
)

function applyCommit(s: CarouselBinding) {
  if (!s.pendingDir) return
  const dir = s.pendingDir
  const total = s.count
  const { currentNode, nodes } = s.nodeBindings
  const isNext = dir.dir === 'left' || dir.dir === 'up'
  const leadingNode = ((currentNode + (isNext ? 1 : 2)) % 3) as 0 | 1 | 2
  const staleNode = ((currentNode + (isNext ? 2 : 1)) % 3)

  const newSceneIdx = isNext
    ? (nodes[leadingNode].sceneIdx + 1) % total
    : (nodes[leadingNode].sceneIdx - 1 + total) % total

  s.nodeBindings.nodes[staleNode].sceneIdx = newSceneIdx
  s.nodeBindings.currentNode = leadingNode
}

// **
//  * Forcibly shifts the currentNode array index back one step 
//  * and restructures the buffer indices to point to the correct sequence.
//  */
function applyPreviousCommit(s: CarouselBinding) {
  const total = s.count
  if (total === 1) return

  const { currentNode, nodes } = s.nodeBindings

  // In a 3-node buffer array [0, 1, 2], the previous element is always moving back 1.
  // Adding 2 and modding by 3 safely wraps backwards.
  const previousNode = ((currentNode + 2) % 3) as 0 | 1 | 2
  const leadingNode = currentNode // The old active node becomes the forward buffer
  const staleNode = ((currentNode + 1) % 3) // The old forward buffer becomes the rear buffer

  // Calculate the target scene index for our new active position
  // If the old active node index is out of bounds due to deletion, wrap it
  const oldActiveSceneIdx = nodes[currentNode].sceneIdx
  const targetActiveSceneIdx = oldActiveSceneIdx > 0
    ? (oldActiveSceneIdx - 1) % (total + 1) // Base wrap against old total
    : total - 1

  // Set the structural positions relative to our target scene index
  s.nodeBindings.nodes[previousNode].sceneIdx = (targetActiveSceneIdx + total) % total
  s.nodeBindings.nodes[leadingNode].sceneIdx = (targetActiveSceneIdx + 1) % total
  s.nodeBindings.nodes[staleNode].sceneIdx = (targetActiveSceneIdx - 1 + total) % total

  // Shift pointer
  s.nodeBindings.currentNode = previousNode
}

/**
 * Defensive utility to ensure that if a future item is deleted, 
 * the virtual buffer nodes don't point to indices outside the new total scene length.
 */
function revalidateBufferBoundaries(s: CarouselBinding) {
  const total = s.count
  const { currentNode, nodes } = s.nodeBindings
  const currentActiveScene = nodes[currentNode].sceneIdx % total

  const nextNode = ((currentNode + 1) % 3) as 0 | 1 | 2
  const prevNode = ((currentNode + 2) % 3) as 0 | 1 | 2

  s.nodeBindings.nodes[currentNode].sceneIdx = currentActiveScene
  s.nodeBindings.nodes[nextNode].sceneIdx = (currentActiveScene + 1) % total
  s.nodeBindings.nodes[prevNode].sceneIdx = (currentActiveScene - 1 + total) % total
}