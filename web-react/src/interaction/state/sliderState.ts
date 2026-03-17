import { createStore } from './stateReactAdapter.ts'
/* -------------------------------
   Types for slider state
--------------------------------- */
interface SliderData {
  value: number         // logical position
  offset: number        // live drag offset
  min: number
  max: number
  size: Vec2
  thumbSize?: Vec2
  dragging?: boolean
}

type SliderMap = Record<string, SliderData>

interface SliderView {
  value: number
  offset: number
  dragging?: boolean
}

interface SliderState {
  sliders: SliderMap
  views: Record<string, SliderView>
}

/* -------------------------------
   Initial store
--------------------------------- */
export const useSliderState = createStore<SliderState>({
  sliders: {},
  views: {}
})

/* -------------------------------
   Slider state functions
--------------------------------- */
export const sliderStateFn = {
  /* -------------------------
       Ensure slider exists
  -------------------------- */
  ensure(id: string, s: SliderState): SliderData {
    let slider = s.sliders[id]
    if (!slider) {
      slider = {
        value: 0,
        offset: 0,
        min: 0,
        max: 100,
        size: {x: 0, y: 0}
      }
      s.sliders[id] = slider
    }
    return slider
  },

  /* -------------------------
       Getters / metadata
  -------------------------- */
  getSize(id: string): Vec2 {
    return useSliderState.getSnapshot().sliders[id]?.size ?? {x: 0, y: 0}
  },

  getThumbSize(id: string): Vec2 {
    return useSliderState.getSnapshot().sliders[id]?.thumbSize ?? {x: 0, y: 0}
  },

  getConstraints(id: string) {
    const s = useSliderState.getSnapshot()
    const slider = s.sliders[id]
    return {
      min: slider?.min ?? 0,
      max: slider?.max ?? 100
    }
  },

  getPosition(id: string): number {
    return useSliderState.getSnapshot().sliders[id]?.value ?? 0
  },

  get(id: string): SliderView {
    const s = useSliderState.getSnapshot()
    const slider = this.ensure(id, s)
    if (!s.views[id]) {
      s.views[id] = {
        value: slider.value,
        offset: slider.offset,
        dragging: slider.dragging
      }
    }
    return s.views[id]
  },

  /* -------------------------
       Setters
  -------------------------- */
  setConstraints(id: string, packet: { min: number; max: number }) {
    useSliderState.setState((s) => {
      const slider = this.ensure(id, s)
      slider.min = packet.min
      slider.max = packet.max
    })
  },

  setSize(id: string, size: Vec2) {
    useSliderState.setState((s) => {
      this.ensure(id, s).size = size
    })
  },

  setThumbSize(id: string, thumbSize: Vec2) {
    useSliderState.setState((s) => {
      this.ensure(id, s).thumbSize = thumbSize
    })
  },

  /* -------------------------
       Dispatcher / actions
  -------------------------- */
  press(desc: Descriptor) {
    useSliderState.setState((s) => {
      const slider = this.ensure(desc.base.id, s)
      slider.value = desc.runtime.delta1D ?? slider.value
    })
  },

  swipeStart(desc: Descriptor) {
    useSliderState.setState((s) => {
      const slider = this.ensure(desc.base.id, s)
      slider.dragging = true
      slider.value = desc.runtime.delta1D ?? slider.value
    })
  },

  swipe(desc: Descriptor) {
    useSliderState.setState((s) => {
      const slider = this.ensure(desc.base.id, s)
      slider.value = desc.runtime.delta1D ?? slider.value
    })
  },

  swipeCommit(desc: Descriptor) {
    useSliderState.setState((s) => {
      const slider = this.ensure(desc.base.id, s)
      slider.value = desc.runtime.delta1D ?? slider.value
      slider.dragging = false
    })
  }
}