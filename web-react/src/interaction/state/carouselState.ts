import { useStore } from './stateReactAdapter.ts'
export const carouselStateFn = {
  /* -------------------------
     Ensure lane exists
-------------------------- */
  ensure(id: string) {
    const s = useStore.getState().getInteractive(id)
    if (!s) {
      const data: InteractiveData = {
        type: 'carousel',
        store: {
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
        }
      }
      useStore.getState().addInteractive({ id, data })
      return data.store
    }
    return s.store
  },

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
    this.ensure(id).currentScenes = scenes
  },

  setCount(id: string, count: number) {
    this.ensure(id).count = Math.max(0, count)
  },

  setSize(id: string, size: Vec2) {
    this.ensure(id).size = size
  },

  setPosition(id: string): boolean {
    const state = this.ensure(id)
    if (!state.pendingDir) return false
    state.settling = true
    state.index = this.getNextIndex(state.index, state.pendingDir, state.count)
    state.offset = 0
    state.pendingDir = null

    requestAnimationFrame(() => {
      useStore.getState().updateInteractive(id, i => {
        i.store.settling = false
      })
    })
    return true
  },
  /* -------------------------
       Dispatcher / mutations
  -------------------------- */
  swipeStart(desc: Descriptor) {
    const store = this.ensure(desc.base.id)
    store.dragging = true
    if (store.pendingDir !== null) {
      store.settling = true
      store.index = this.getNextIndex(store.index, store.pendingDir, store.count)
      store.offset = 0
      store.pendingDir = null
      return
    }
    store.pendingDir = null
  },

  swipe(desc: Descriptor) {
    const store = this.ensure(desc.base.id)
    store.offset = desc.runtime.delta1D ?? store.offset
  },

  swipeCommit(desc: Descriptor) {
    const store = this.ensure(desc.base.id)
    store.pendingDir = desc.runtime.direction ?? null
    store.offset = desc.runtime.delta1D ?? store.offset
    store.dragging = false
  },

  swipeRevert(desc: Descriptor) {
    const store = this.ensure(desc.base.id)
    store.offset = 0
    store.dragging = false
    store.pendingDir = null
  }
}