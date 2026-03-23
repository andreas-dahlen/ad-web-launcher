import { store } from "./zustandStore"
/* -------------------------------
   Slider state functions
--------------------------------- */
export const sliderStateFn = {
  /* -------------------------
       Ensure slider exists
  -------------------------- */
  ensure(id: string): SliderState {
    return store.ensure('slider', id, {
      value: 0,
      offset: 0,
      min: 0,
      max: 100,
      size: { x: 0, y: 0 }
    })
    // let slider = s.sliders[id]
    // if (!slider) {
    //   slider = {
    //     value: 0,
    //     offset: 0,
    //     min: 0,
    //     max: 100,
    //     size: {x: 0, y: 0}
    //   }
    //   s.sliders[id] = slider
    // }
    // return slider
  },

  /* -------------------------
       Getters / metadata
  -------------------------- */
  getSize(id: string): Vec2 {
    return this.ensure(id).size

    // return useSliderState.getSnapshot().sliders[id]?.size ?? {x: 0, y: 0}
  },

  getThumbSize(id: string): Vec2 {
    return this.ensure(id).thumbSize ?? { x: 0, y: 0 }

    // return useSliderState.getSnapshot().sliders[id]?.thumbSize ?? {x: 0, y: 0}
  },

  getConstraints(id: string) {
    const state = this.ensure(id)
    return {
      min: state.min,
      max: state.max
    }
    // const s = useSliderState.getSnapshot()
    // const slider = s.sliders[id]
    // return {
    //   min: slider?.min ?? 0,
    //   max: slider?.max ?? 100
    // }
  },

  getPosition(id: string): number {
    return this.ensure(id).value
    // return useSliderState.getSnapshot().sliders[id]?.value ?? 0
  },

  // get(id: string): SliderView {
  //   const s = useSliderState.getSnapshot()
  //   const slider = this.ensure(id, s)
  //   if (!s.views[id]) {
  //     s.views[id] = {
  //       value: slider.value,
  //       offset: slider.offset,
  //       dragging: slider.dragging
  //     }
  //   }
  //   return s.views[id]
  // },

  /* -------------------------
       Setters
  -------------------------- */
  setConstraints(id: string, packet: { min: number; max: number }) {
    this.ensure(id)
    store.mutate('slider', id, (s) => {
      s.min = packet.min
      s.max = packet.max
    })
    // useSliderState.setState((s) => {
    //   const slider = this.ensure(id, s)
    //   slider.min = packet.min
    //   slider.max = packet.max
    // })
  },

  setSize(id: string, size: Vec2) {
    this.ensure(id)
    store.mutate('slider', id, (s) => {
      s.size = size
    })
    // useSliderState.setState((s) => {
    //   this.ensure(id, s).size = size
    // })
  },

  setThumbSize(id: string, thumbSize: Vec2) {
    this.ensure(id)
    store.mutate('slider', id, (s) => {
      s.thumbSize = thumbSize
    })

    // useSliderState.setState((s) => {
    //   this.ensure(id, s).thumbSize = thumbSize
    // })
  },

  /* -------------------------
       Dispatcher / actions
  -------------------------- */
  press(desc: Descriptor) {
    this.ensure(desc.base.id)
    store.mutate('slider', desc.base.id, (s) => {
      s.value = desc.runtime.delta1D ?? s.value
    })

    // useSliderState.setState((s) => {
    //   const slider = this.ensure(desc.base.id, s)
    //   slider.value = desc.runtime.delta1D ?? slider.value
    // })
  },

  swipeStart(desc: Descriptor) {
    this.ensure(desc.base.id)
    store.mutate('slider', desc.base.id, (s) => {
      s.dragging = true
      s.value = desc.runtime.delta1D ?? s.value
    })

    // useSliderState.setState((s) => {
    //   const slider = this.ensure(desc.base.id, s)
    //   slider.dragging = true
    //   slider.value = desc.runtime.delta1D ?? slider.value
    // })
  },

  swipe(desc: Descriptor) {
        this.ensure(desc.base.id)
    store.mutate('slider', desc.base.id, (s) => {
      s.value = desc.runtime.delta1D ?? s.value
    })
    // useSliderState.setState((s) => {
    //   const slider = this.ensure(desc.base.id, s)
    //   slider.value = desc.runtime.delta1D ?? slider.value
    // })
  },

  swipeCommit(desc: Descriptor) {
        this.ensure(desc.base.id)
    store.mutate('slider', desc.base.id, (s) => {
      s.value = desc.runtime.delta1D ?? s.value
      s.dragging = false
    })

    // useSliderState.setState((s) => {
    //   const slider = this.ensure(desc.base.id, s)
    //   slider.value = desc.runtime.delta1D ?? slider.value
    //   slider.dragging = false
    // })
  }
}