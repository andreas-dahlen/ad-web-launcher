import { store } from './zustandStore.ts'
export const dragStateFn = {
  /* -------------------------
       Ensure state exists
  -------------------------- */
  ensure(id: string): DragState {
    return store.ensure('drag', id, {
      position: {x: 0, y: 0},
      offset: {x: 0, y: 0},
      dragging: false
      //minX, maxX, minY, maxY are all optional...
    })

    // let lane = s.lanes[id]
    // if (!lane) {
    //   lane = {
    //     position: { ...ZERO_POINT },
    //     offset: { ...ZERO_POINT },
    //     dragging: false
    //   }
    //   s.lanes[id] = lane
    // }
    // return lane
  },

  /* -------------------------
       Metadata / getters
  -------------------------- */
  // getSize(id: string): number {
  //   return useDragState.getSnapshot().lanes[id]?.size ?? 0
  // },

  getConstraints(id: string) {
    const state = this.ensure(id)
    return {
      minX: state.minX,
      minY: state.minY,
      maxX: state.maxX,
      maxY: state.maxY
    }
  },

  getPosition(id: string): Vec2 {
    return this.ensure(id).position
    // return useDragState.getSnapshot().lanes[id]?.position ?? { ...ZERO_POINT }
  },

  // get(id: string): DragLaneView {
  //   const s = useDragState.getSnapshot()
  //   const lane = this.ensure(id, s)
  //   if (!s.views[id]) {
  //     s.views[id] = {
  //       position: { ...lane.position },
  //       offset: { ...lane.offset },
  //       dragging: lane.dragging
  //     }
  //   }
  //   return s.views[id]
  // },

  /* -------------------------
       Setters / configuration
  -------------------------- */
  // setSize(id: string, size: number) {
  //   useDragState.setState((s) => {
  //     this.ensure(id, s).size = size ?? 0
  //   })
  // },

  setConstraints( id: string, packet: { minX?: number; minY?: number; maxX?: number; maxY?: number }
  ) {
    this.ensure(id)
    // useDragState.setState((s) => {
    //   const lane = this.ensure(id, s)
    store.mutate('drag', id, (s) => {
      s.minX = packet.minX
      s.maxX = packet.maxX
      s.minY = packet.minY
      s.maxY = packet.maxY
    })
      // state.minX = packet.minX
      // state.minY = packet.minY
      // state.maxX = packet.maxX
      // state.maxY = packet.maxY
    // })
  },

  setPosition(id: string, pos: Vec2) {
    this.ensure(id)
    // useDragState.setState((s) => {
    //   const lane = this.ensure(id, s)
    store.mutate('drag', id, (s) => {
      s.position = {x: pos.x, y: pos.y}
    })
      // state.position = { x: pos.x, y: pos.y }
    // })
  },

  /* -------------------------
       Dispatcher / mutations
  -------------------------- */
  swipeStart(desc: Descriptor) {
    this.ensure(desc.base.id)
    // state.dragging = true
    // state.offset = { x: 0, y: 0 }
    store.mutate('drag', desc.base.id, (s) => {
      s.dragging = true
      s.offset = {x: 0, y: 0}
    })

    // useDragState.setState((s) => {
    //   const lane = this.ensure(desc.base.id, s)
    //   lane.dragging = true
    //   lane.offset = { ...ZERO_POINT }
    // })
  },

  swipe(desc: Descriptor) {
    this.ensure(desc.base.id)
    // state.offset = desc.runtime.delta
    store.mutate('drag', desc.base.id, (s) => {
    s.offset = desc.runtime.delta
    })

    // useDragState.setState((s) => {
    //   const lane = this.ensure(desc.base.id, s)
    //   lane.offset = desc.runtime.delta
    // })
  },

  swipeCommit(desc: Descriptor) {
    this.ensure(desc.base.id)

        store.mutate('drag', desc.base.id, (s) => {
    s.position = desc.runtime.delta
    s.offset = {x: 0, y: 0}
    s.dragging = false
    })
    // state.position = desc.runtime.delta
    // state.offset = {x: 0, y: 0}
    // state.dragging = false

    // useDragState.setState((s) => {
    //   const lane = this.ensure(desc.base.id, s)
    //   lane.position = desc.runtime.delta
    //   lane.offset = { ...ZERO_POINT }
    //   lane.dragging = false
    // })
  }
}