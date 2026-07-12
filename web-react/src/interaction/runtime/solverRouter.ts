import { carouselSolver } from '@interaction/solvers/carouselSolver/carousel.solver';
import { dragSolver } from '@interaction/solvers/dragSolver/drag.solver';
import { scrollSolver } from '@interaction/solvers/scrollSolver/scroll.solver';
import { sliderSolver } from '@interaction/solvers/sliderSolver/slider.solver';
import type { CarouselAction, DragAction, RouterPackage, ScrollAction, SliderAction } from '@interaction/types/runtime/action.types';
import type { Computed } from '@interaction/types/runtime/computed.types';
import type { CarouselDesc, DragDesc, ScrollDesc, SliderDesc } from '@interaction/types/descriptor/descriptor.types';
import type { Runtime } from '@interaction/types/runtime/runtime.types';
import { assertScrollComputed, assertSliderComputed } from '@utils/assertions';

export const router = {
  carousel(runtime: Runtime, desc: CarouselDesc): RouterPackage<CarouselAction> | null {
    const { event } = runtime
    switch (event) {
      case 'press': return null
      case 'pressRelease': return null
      case 'swipeStart': {
        return { action: { event } }
      }
      case 'swipe': {
        const result = carouselSolver.swipe(runtime, desc)
        if (!result) return null
        return { action: { event, payload: result.payload } }
      }
      case 'swipeCommit': {
        const result = carouselSolver.swipeCommit(runtime, desc)
        if (result.route === 'default') {
          return { action: { event, payload: result.payload } }
        }
        return {
          action: { event: "swipeRevert" },
          effects: { eventOverride: "swipeRevert" }
        }
      }
      default: throw new Error(`Unknown event for carousel solvers: ${event}`)
    }
  },

  slider(runtime: Runtime, desc: SliderDesc, computed: Computed): RouterPackage<SliderAction> | null {
    const { event } = runtime
    switch (event) {
      case 'pressRelease': return null
      case 'press': {
        return {
          action: {
            event,
            payload: sliderSolver.press(runtime, desc).payload
          }
        }
      }
      case 'swipeStart': {
        const result = sliderSolver.swipeStart(runtime, desc)
        return {
          action: {
            event,
            payload: result.payload,
          },
          effects: {
            computedUpdate: { pointerId: desc.base.pointerId, ...result.computedUpdate }
          }
        }
      }
      case 'swipe': {
        assertSliderComputed(computed)
        const result = sliderSolver.swipe(runtime, desc, computed)
        if (!result) return null
        return { action: { event, payload: result.payload } }
      }
      case 'swipeCommit': {
        assertSliderComputed(computed)
        const result = sliderSolver.swipeCommit(runtime, desc, computed)
        if (!result) return null
        return { action: { event, payload: result.payload } }
      }
      default: throw new Error(`Unknown event for slider solvers: ${event}`)
    }
  },

  drag(runtime: Runtime, desc: DragDesc): RouterPackage<DragAction> | null {
    const { event } = runtime
    switch (event) {
      case 'press': return null
      case 'pressRelease': return null
      case 'swipeStart': {
        return {
          action: {
            event,
            payload: dragSolver.swipeStart(runtime, desc).payload
          }
        }
      }
      case 'swipe': {
        return {
          action: {
            event,
            payload: dragSolver.swipe(runtime, desc).payload
          }
        }
      }
      case 'swipeCommit': {
        return {
          action: {
            event,
            payload: dragSolver.swipeCommit(runtime, desc).payload
          }
        }
      }
      default: throw new Error(`Unknown event for drag solvers: ${event}`)
    }
  },

  scroll(runtime: Runtime, desc: ScrollDesc, computed: Computed): RouterPackage<ScrollAction> | null {
    const { event } = runtime
    switch (event) {
      case 'press': return null
      case 'pressRelease': return null
      case 'swipeStart': {
        const result = scrollSolver.swipeStart(runtime, desc)
        const computedUpdate = { pointerId: desc.base.pointerId, ...result.computedUpdate }

        if (result.payload.isOverflow === true) {
          return {
            action: { event, payload: result.payload },
            effects: { computedUpdate }
          }
        }
        return {
          action: { event, payload: result.payload },
          effects: { computedUpdate }
        }
      }
      case 'swipe': {
        assertScrollComputed(computed)
        const result = scrollSolver.swipe(runtime, desc, computed)
        if (result.payload.isOverflow)
          return { action: { event, payload: result.payload } }
        return { action: { event, payload: result.payload } }
      }

      case 'swipeCommit': {
        assertScrollComputed(computed)
        const solution = scrollSolver.swipeCommit(runtime, desc, computed)
        if (solution.route === 'default' && solution.payload.isOverflow) {
          return { action: { event, payload: solution.payload } }
        }
        if (solution.route === 'default' && !solution.payload.isOverflow) {
          return { action: { event, payload: solution.payload } }
        }
        if (solution.route === "revert") {
          return {
            action: { event: "swipeRevert", payload: solution.payload },
            effects: { eventOverride: "swipeRevert" }
          }
        }
        throw new Error(`Unknown carousel solution from swipeCommit: ${solution}`)
      }
      default: throw new Error(`Unknown event for scroll solvers: ${event}`)
    }
  }
}