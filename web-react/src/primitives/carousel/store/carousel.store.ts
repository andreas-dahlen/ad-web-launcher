import { immer } from "zustand/middleware/immer"
import { create } from 'zustand'
import type { Direction } from '../../../shared/typing/core.types'
import type { StoreLayout } from '@typing/store.types'
import type { CarouselAction } from '@interaction/types/action.types'
import { assertNever } from '@utils/assersions'
export type NodeIdx = 0 | 1 | 2

export type NodeBinding = {
  nodeIdx: NodeIdx
  sceneIdx: number
}

export type RingState = {
  nodes: [NodeBinding, NodeBinding, NodeBinding]
  currentNode: NodeIdx
}

// export type RingAction = {
//   type: 'commit'
//   direction: Direction
//   total: number
// }
export type CarouselBinding = {

  ring: RingState
  //react motion
  index: number
  liveOffset: number

  //reactScenes
  count: number
  layout: StoreLayout
  dragging: boolean

  //read only... not used by react
  settling: boolean
  pendingDir: Direction | null
}

export type CarouselStore = {
  bindings: Record<string, CarouselBinding>
  init: (id: string, fallback: CarouselBinding) => void
  get: (id: string) => Readonly<CarouselBinding>
  delete: (id: string) => void

  setCount: (id: string, count: number) => void

  setLayout: (id: string, packet: StoreLayout) => void

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
        console.log("index before:", s.index)
        s.index = getNextIndex(s.index, s.pendingDir, s.count)
        console.log("index after:", s.index)
        console.log("before ring current node:", s.ring.currentNode)
        commitRingImmer(s)
        console.log("after ring current node:", s.ring.currentNode)
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
            if (s.pendingDir !== null) {
              commitRingImmer(s)
              s.index = getNextIndex(s.index, s.pendingDir, s.count)
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

function getNextIndex(currentIndex: number, direction: Direction | null, count: number): number {
  if (!count || !direction) return currentIndex
  switch (direction.dir) {
    case 'right':
    case 'down':
      return (currentIndex - 1 + count) % count
    case 'left':
    case 'up':
      return (currentIndex + 1) % count
    default:
      return currentIndex
  }
}

function commitRingImmer(s: CarouselBinding) {
  if (!s.pendingDir) return
  const dir = s.pendingDir
  const total = s.count
  const { currentNode, nodes } = s.ring
  const isNext = dir.dir === 'left' || dir.dir === 'up'
  const leadingNode = ((currentNode + (isNext ? 1 : 2)) % 3) as 0 | 1 | 2
  const staleNode = ((currentNode + (isNext ? 2 : 1)) % 3) as 0 | 1 | 2
  const newSceneIdx = isNext
    ? (nodes[leadingNode].sceneIdx + 1) % total
    : (nodes[leadingNode].sceneIdx - 1 + total) % total
  s.ring.nodes[staleNode].sceneIdx = newSceneIdx
  s.ring.currentNode = leadingNode
}