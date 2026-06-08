import { carouselSolver } from '@interaction/solvers/carouselSolver/carousel.solver';
import { dragSolver } from '@interaction/solvers/dragSolver/drag.solver';
import { scrollSolver } from '@interaction/solvers/scrollSolver/scroll.solver';
import { sliderSolver } from '@interaction/solvers/sliderSolver/slider.solver';
import type { Computed } from '@interaction/types/computed.types';
import type { CarouselDesc, DragDesc, ScrollDesc, SliderDesc } from '@interaction/types/descriptor.types';
import type { Runtime } from '@interaction/types/runtime.types';
import type { CarouselAction } from '@primitives/carousel/store/carousel.store';
import type { DragAction } from '@primitives/drag/store/drag.store';
import type { ScrollAction } from '@primitives/scroll/store/scroll.store';
import type { SliderAction } from '@primitives/slider/store/slider.store';

import { assertScrollComputed, assertSliderComputed } from '@typing/core.types';

export const router = {
  carousel(runtime: Runtime, desc: CarouselDesc): CarouselAction | null {
    const { event } = runtime
    switch (event) {
      case 'press': return null
      case 'pressRelease': return null
      case 'swipeStart': {
        return { event }
      }
      case 'swipe': {
        const result = carouselSolver.swipe(runtime, desc)
        if (!result) return null
        // console.log("carousel delta: ", result.solv.delta1D)
        return { event, payload: result.solv }
      }
      case 'swipeCommit': {
        const result = carouselSolver.swipeCommit(runtime, desc)
        if (result.routing === 'store') {
          return { event, payload: result.solv }
        } else {
          return { event: result.event }
        }
      }
      default: throw new Error(`Unknown event for carousel solvers: ${event}`)
    }
  },

  slider(runtime: Runtime, desc: SliderDesc, computed: Computed): SliderAction | null {
    const { event } = runtime
    switch (event) {
      case 'pressRelease': return null
      case 'press': {
        return {
          event,
          payload: sliderSolver.press(runtime, desc).solv
        }
      }
      case 'swipeStart': {
        return {
          event,
          payload: sliderSolver.swipeStart(runtime, desc).solv
        }
      }
      case 'swipe': {
        assertSliderComputed(computed)
        const result = sliderSolver.swipe(runtime, desc, computed)
        if (!result) return null
        return { event, payload: result.solv }
      }
      case 'swipeCommit': {
        assertSliderComputed(computed)
        const result = sliderSolver.swipeCommit(runtime, desc, computed)
        if (!result) return null //TODO add back noop for debugging { type: 'noop'; reason: 'no-op-swipe' }
        return { event, payload: result.solv }
      }
      default: throw new Error(`Unknown event for slider solvers: ${event}`)
    }
  },

  drag(runtime: Runtime, desc: DragDesc): DragAction | null {
    const { event } = runtime
    switch (event) {
      case 'press': return null
      case 'pressRelease': return null
      case 'swipeStart': {
        return {
          event,
          payload: dragSolver.swipeStart(runtime, desc).solv
        }
      }
      case 'swipe': {
        return {
          event,
          payload: dragSolver.swipe(runtime, desc).solv
        }
      }
      case 'swipeCommit': {
        return {
          event,
          payload: dragSolver.swipeCommit(runtime, desc).solv
        }
      }
      default: throw new Error(`Unknown event for drag solvers: ${event}`)
    }
  },

  scroll(runtime: Runtime, desc: ScrollDesc, computed: Computed): ScrollAction | null {
    const { event } = runtime
    switch (event) {
      case 'press': return null
      case 'pressRelease': return null
      case 'swipeStart': {
        return {
          event,
          payload: scrollSolver.swipeStart(runtime, desc).solv
        }
      }
      case 'swipe': {
        assertScrollComputed(computed)
        // const result = scrollSolver.swipe(runtime, desc, computed).solv
        // console.log("scroll delta: ", result.delta1D)
        // console.log(runtime.delta)
        // console.log("overflow delta: ", result.overflowValue)
        // console.log("startOverflowValue: ", computed.startOverflowValue)
        return {
          event,
          // payload: result
          payload: scrollSolver.swipe(runtime, desc, computed).solv
        }
      }
      case 'swipeCommit': {
        assertScrollComputed(computed)
        const result = scrollSolver.swipeCommit(runtime, desc, computed)
        if (result.routing === 'store') {
          return { event, payload: result.solv }
        } else {
          return { event: result.event, payload: result.solv }
        }
      }
      default: throw new Error(`Unknown event for scroll solvers: ${event}`)
    }
  }
}