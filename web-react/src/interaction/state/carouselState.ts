import { store } from './zustandStore.ts'
import type { Direction, Vec2 } from '@interaction/types/primitives.ts'
import type { Descriptor } from '@interaction/types/descriptor.ts'
export const carouselStateFn = {
  /* -------------------------
     Ensure lane exists
-------------------------- */
  ensure(id: string): CarouselState {
    return store.ensure('carousel', id, {
      index: 0,
      count: 0,
      offset: 0,
      size: { x: 0, y: 0 },
      dragging: false,
      settling: false,
      pendingDir: null,
      lockPrevAt: null,
      lockNextAt: null,
      currentScenes: [0, 1, 2]
    })
  },
  /* -------------------------
getters
-------------------------- */
  getNextIndex(currentIndex: number, direction: Direction | null, count: number): number {
    if (!count) return 0
    switch (direction) {
      case 'right':
      case 'down':
        return (currentIndex - 1 + count) % count
      case 'left':
      case 'up':
        return (currentIndex + 1) % count
      default:
        return currentIndex
    }
  },

  getSize(id: string): Vec2 {
    return this.ensure(id).size
  },

  getCurrentIndex(id: string): number {
    return this.ensure(id).index
  },
  /* -------------------------
  Configuration / layout
  -------------------------- */
  setCurrentScenes(id: string, scenes: number[]) {
    this.ensure(id)
    store.mutate('carousel', id, (s) => {
      s.currentScenes = [...scenes]
    })
  },

  setCount(id: string, count: number) {
    this.ensure(id)
    store.mutate('carousel', id, (s) => {
      s.count = Math.max(0, count)
    })
  },

  setSize(id: string, trackSize: Vec2) {
    this.ensure(id)
    store.mutate('carousel', id, (s) => {
      if (s.size.x === trackSize.x && s.size.y === trackSize.y) return
      s.size = trackSize
    })
  },

  setPosition(id: string) {
    const lane = this.ensure(id)
    if (!lane.pendingDir) return false

    store.mutate('carousel', id, (s) => {
      s.settling = true
      s.index = this.getNextIndex(s.index, s.pendingDir, s.count)
      s.offset = 0
      s.pendingDir = null
    })

    requestAnimationFrame(() => {
      store.mutate('carousel', id, (s) => {
        s.settling = false
      })
    })

    // return true
  },
  /* -------------------------
       Dispatcher / mutations
  -------------------------- */
  swipeStart(desc: Descriptor) {
    this.ensure(desc.base.id)
    store.mutate('carousel', desc.base.id, (s) => {
      s.dragging = true
      s.settling = false
      if (s.pendingDir !== null) {
        s.index = this.getNextIndex(s.index, s.pendingDir, s.count)
        s.offset = 0
        s.pendingDir = null
      }
    })
  },

  swipe(desc: Descriptor) {
    this.ensure(desc.base.id)
    store.mutate('carousel', desc.base.id, (s) => {
      s.offset = desc.runtime.delta1D ?? s.offset
    })
  },

  swipeCommit(desc: Descriptor) {
    this.ensure(desc.base.id)

    store.mutate('carousel', desc.base.id, (s) => {
      if (s.settling) return

      s.pendingDir = desc.runtime.direction ?? null
      s.offset = desc.runtime.delta1D ?? s.offset
      s.dragging = false
    })
  },

  swipeRevert(desc: Descriptor) {
    this.ensure(desc.base.id)
    store.mutate('carousel', desc.base.id, (s) => {
      s.offset = 0
      s.dragging = false
      s.pendingDir = null
    })
  }
}