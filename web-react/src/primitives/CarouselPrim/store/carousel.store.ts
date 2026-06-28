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