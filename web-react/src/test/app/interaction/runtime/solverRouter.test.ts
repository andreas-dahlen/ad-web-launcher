import { beforeEach, describe, expect, it, vi } from 'vitest'

import { router } from '@interaction/runtime/solverRouter.ts'
import { carouselSolver } from '@interaction/solvers/carouselSolver/carousel.solver.ts'
import { dragSolver } from '@interaction/solvers/dragSolver/drag.solver.ts'
import { scrollSolver } from '@interaction/solvers/scrollSolver/scroll.solver.ts'
import { sliderSolver } from '@interaction/solvers/sliderSolver/slider.solver.ts'

import {
  createCarouselDesc,
  createDragDesc,
  createScrollDesc,
  createSliderDesc
} from '@test/app/interaction/builders/desc.factory.ts'

import {
  createRuntimePress,
  createRuntimePressRelease,
  createRuntimeSwipe,
  createRuntimeswipeStart,
  createRuntimeSwipeCommit
} from '@test/app/interaction/builders/runtime.factory.ts'

import type {
  SliderComputed,
  ScrollComputed
} from '@interaction/types/runtime/computed.types.ts'

vi.mock('@interaction/solvers/carouselSolver/carousel.solver', () => ({
  carouselSolver: {
    swipe: vi.fn(),
    swipeCommit: vi.fn()
  }
}))

vi.mock('@interaction/solvers/dragSolver/drag.solver', () => ({
  dragSolver: {
    swipeStart: vi.fn(),
    swipe: vi.fn(),
    swipeCommit: vi.fn()
  }
}))

vi.mock('@interaction/solvers/scrollSolver/scroll.solver', () => ({
  scrollSolver: {
    swipeStart: vi.fn(),
    swipe: vi.fn(),
    swipeCommit: vi.fn()
  }
}))

vi.mock('@interaction/solvers/sliderSolver/slider.solver', () => ({
  sliderSolver: {
    press: vi.fn(),
    swipeStart: vi.fn(),
    swipe: vi.fn(),
    swipeCommit: vi.fn()
  }
}))

describe('[ROUTER]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('[Carousel]', () => {
    const desc = createCarouselDesc()

    it('returns null for press', () => {
      const runtime = createRuntimePress()

      expect(router.carousel(runtime, desc)).toBeNull()
    })

    it('returns null for pressRelease', () => {
      const runtime = createRuntimePressRelease()

      expect(router.carousel(runtime, desc)).toBeNull()
    })

    it('routes swipeStart', () => {
      const runtime = createRuntimeswipeStart()

      expect(router.carousel(runtime, desc)).toEqual({
        action: {
          event: 'swipeStart'
        }
      })
    })

    it('routes swipe with the solver payload', () => {
      const runtime = createRuntimeSwipe()

      const solution = {
        route: 'default' as const,
        payload: {
          delta1D: 123
        }
      }

      vi.mocked(carouselSolver.swipe).mockReturnValue(solution)

      expect(router.carousel(runtime, desc)).toEqual({
        action: {
          event: 'swipe',
          payload: solution.payload
        }
      })

      expect(carouselSolver.swipe).toHaveBeenCalledWith(runtime, desc)
    })

    it('returns null when swipe solver returns null', () => {
      const runtime = createRuntimeSwipe()

      vi.mocked(carouselSolver.swipe).mockReturnValue(null)

      expect(router.carousel(runtime, desc)).toBeNull()
    })

    it('routes swipeCommit with the solver payload', () => {
      const runtime = createRuntimeSwipeCommit()

      const solution = {
        route: 'default' as const,
        payload: {
          delta1D: 200,
          direction: {
            axis: 'horizontal' as const,
            dir: 'right' as const
          }
        }
      }

      vi.mocked(carouselSolver.swipeCommit).mockReturnValue(solution)

      expect(router.carousel(runtime, desc)).toEqual({
        action: {
          event: 'swipeCommit',
          payload: solution.payload
        }
      })

      expect(carouselSolver.swipeCommit).toHaveBeenCalledWith(runtime, desc)
    })

    it('routes swipeCommit to swipeRevert when solver requests revert', () => {
      const runtime = createRuntimeSwipeCommit()

      vi.mocked(carouselSolver.swipeCommit).mockReturnValue({
        route: 'revert'
      } as never)

      expect(router.carousel(runtime, desc)).toEqual({
        action: {
          event: 'swipeRevert'
        },
        effects: {
          eventOverride: 'swipeRevert'
        }
      })

      expect(carouselSolver.swipeCommit).toHaveBeenCalledWith(runtime, desc)
    })

    it('throws for an unknown event', () => {
      const runtime = {
        ...createRuntimePress(),
        event: 'banana'
      } as never

      expect(() => router.carousel(runtime, desc)).toThrow(
        'Unknown event for carousel solvers: banana'
      )
    })
  })

  describe('[Slider]', () => {
    const desc = createSliderDesc()

    const computed: SliderComputed = {
      sliderStartOffset: 100,
      sliderValuePerPixel: 0.5
    }

    it('returns null for pressRelease', () => {
      const runtime = createRuntimePressRelease()

      expect(router.slider(runtime, desc, computed)).toBeNull()
    })

    it('routes press with the solver payload', () => {
      const runtime = createRuntimePress()

      const solution = {
        route: 'default' as const,
        payload: {
          delta1D: 42
        }
      }

      vi.mocked(sliderSolver.press).mockReturnValue(solution)

      expect(router.slider(runtime, desc, computed)).toEqual({
        action: {
          event: 'press',
          payload: solution.payload
        }
      })

      expect(sliderSolver.press).toHaveBeenCalledWith(runtime, desc)
    })

    it('routes swipeStart with payload and computedUpdate', () => {
      const runtime = createRuntimeswipeStart()

      const solution = {
        route: 'default' as const,
        payload: {
          delta1D: 25
        },
        computedUpdate: {
          sliderStartOffset: 80,
          sliderValuePerPixel: 0.25
        }
      }

      vi.mocked(sliderSolver.swipeStart).mockReturnValue(solution)

      expect(router.slider(runtime, desc, computed)).toEqual({
        action: {
          event: 'swipeStart',
          payload: solution.payload
        },
        effects: {
          computedUpdate: {
            pointerId: desc.base.pointerId,
            ...solution.computedUpdate
          }
        }
      })

      expect(sliderSolver.swipeStart).toHaveBeenCalledWith(runtime, desc)
    })

    it('requires computed data for swipe', () => {
      const runtime = createRuntimeSwipe()

      expect(() => router.slider(runtime, desc, null)).toThrow(
        'computed is required for slider'
      )

      expect(sliderSolver.swipe).not.toHaveBeenCalled()
    })

    it('routes swipe with computed data and solver payload', () => {
      const runtime = createRuntimeSwipe()

      const solution = {
        route: 'default' as const,
        payload: {
          delta1D: 75
        }
      }

      vi.mocked(sliderSolver.swipe).mockReturnValue(solution)

      expect(router.slider(runtime, desc, computed)).toEqual({
        action: {
          event: 'swipe',
          payload: solution.payload
        }
      })

      expect(sliderSolver.swipe).toHaveBeenCalledWith(
        runtime,
        desc,
        computed
      )
    })

    it('returns null when swipe solver returns null', () => {
      const runtime = createRuntimeSwipe()

      vi.mocked(sliderSolver.swipe).mockReturnValue(null)

      expect(router.slider(runtime, desc, computed)).toBeNull()
    })

    it('requires computed data for swipeCommit', () => {
      const runtime = createRuntimeSwipeCommit()

      expect(() => router.slider(runtime, desc, null)).toThrow(
        'computed is required for slider'
      )

      expect(sliderSolver.swipeCommit).not.toHaveBeenCalled()
    })

    it('routes swipeCommit with computed data and solver payload', () => {
      const runtime = createRuntimeSwipeCommit()

      const solution = {
        route: 'default' as const,
        payload: {
          delta1D: 100
        }
      }

      vi.mocked(sliderSolver.swipeCommit).mockReturnValue(solution)

      expect(router.slider(runtime, desc, computed)).toEqual({
        action: {
          event: 'swipeCommit',
          payload: solution.payload
        }
      })

      expect(sliderSolver.swipeCommit).toHaveBeenCalledWith(
        runtime,
        desc,
        computed
      )
    })

    it('returns null when swipeCommit solver returns null', () => {
      const runtime = createRuntimeSwipeCommit()

      vi.mocked(sliderSolver.swipeCommit).mockReturnValue(null)

      expect(router.slider(runtime, desc, computed)).toBeNull()
    })

    it('throws for an unknown event', () => {
      const runtime = {
        ...createRuntimePress(),
        event: 'banana'
      } as never

      expect(() => router.slider(runtime, desc, computed)).toThrow(
        'Unknown event for slider solvers: banana'
      )
    })
  })

  describe('[Drag]', () => {
    const desc = createDragDesc()

    it('returns null for press', () => {
      const runtime = createRuntimePress()

      expect(router.drag(runtime, desc)).toBeNull()
    })

    it('returns null for pressRelease', () => {
      const runtime = createRuntimePressRelease()

      expect(router.drag(runtime, desc)).toBeNull()
    })

    it('routes swipeStart with solver payload', () => {
      const runtime = createRuntimeswipeStart()

      const solution = {
        route: 'default' as const,
        payload: {
          frameRect: {
            left: 0,
            top: 0
          }
        }
      }

      vi.mocked(dragSolver.swipeStart).mockReturnValue(solution)

      expect(router.drag(runtime, desc)).toEqual({
        action: {
          event: 'swipeStart',
          payload: solution.payload
        }
      })

      expect(dragSolver.swipeStart).toHaveBeenCalledWith(runtime, desc)
    })

    it('routes swipe with solver payload', () => {
      const runtime = createRuntimeSwipe()

      const solution = {
        route: 'default' as const,
        payload: {
          delta: {
            x: 20,
            y: 30
          }
        }
      }

      vi.mocked(dragSolver.swipe).mockReturnValue(solution)

      expect(router.drag(runtime, desc)).toEqual({
        action: {
          event: 'swipe',
          payload: solution.payload
        }
      })

      expect(dragSolver.swipe).toHaveBeenCalledWith(runtime, desc)
    })

    it('routes swipeCommit with solver payload', () => {
      const runtime = createRuntimeSwipeCommit()

      const solution = {
        route: 'default' as const,
        payload: {
          delta: {
            x: 50,
            y: 60
          }
        }
      }

      vi.mocked(dragSolver.swipeCommit).mockReturnValue(solution)

      expect(router.drag(runtime, desc)).toEqual({
        action: {
          event: 'swipeCommit',
          payload: solution.payload
        }
      })

      expect(dragSolver.swipeCommit).toHaveBeenCalledWith(runtime, desc)
    })

    it('throws for an unknown event', () => {
      const runtime = {
        ...createRuntimePress(),
        event: 'banana'
      } as never

      expect(() => router.drag(runtime, desc)).toThrow(
        'Unknown event for drag solvers: banana'
      )
    })
  })

  describe('[Scroll]', () => {
    const desc = createScrollDesc()

    const computed: ScrollComputed = {
      isOverflow: false,
      startOverflowValue: 0
    }

    it('returns null for press', () => {
      const runtime = createRuntimePress()

      expect(router.scroll(runtime, desc, computed)).toBeNull()
    })

    it('returns null for pressRelease', () => {
      const runtime = createRuntimePressRelease()

      expect(router.scroll(runtime, desc, computed)).toBeNull()
    })

    it('routes swipeStart with payload and computedUpdate', () => {
      const runtime = createRuntimeswipeStart()

      const solution = {
        route: 'default' as const,
        payload: {
          delta1D: 25,
          isOverflow: false as const
        },
        computedUpdate: {
          isOverflow: false,
          startOverflowValue: 10
        }
      }

      vi.mocked(scrollSolver.swipeStart).mockReturnValue(solution)

      expect(router.scroll(runtime, desc, computed)).toEqual({
        action: {
          event: 'swipeStart',
          payload: solution.payload
        },
        effects: {
          computedUpdate: {
            pointerId: desc.base.pointerId,
            ...solution.computedUpdate
          }
        }
      })

      expect(scrollSolver.swipeStart).toHaveBeenCalledWith(runtime, desc)
    })

    it('requires computed data for swipe', () => {
      const runtime = createRuntimeSwipe()

      expect(() => router.scroll(runtime, desc, null)).toThrow(
        'computed is required for scroll'
      )

      expect(scrollSolver.swipe).not.toHaveBeenCalled()
    })

    it('routes swipe with solver payload', () => {
      const runtime = createRuntimeSwipe()

      const solution = {
        route: 'default' as const,
        payload: {
          delta1D: 75,
          isOverflow: false as const
        }
      }

      vi.mocked(scrollSolver.swipe).mockReturnValue(solution)

      expect(router.scroll(runtime, desc, computed)).toEqual({
        action: {
          event: 'swipe',
          payload: solution.payload
        }
      })

      expect(scrollSolver.swipe).toHaveBeenCalledWith(
        runtime,
        desc,
        computed
      )
    })

    it('requires computed data for swipeCommit', () => {
      const runtime = createRuntimeSwipeCommit()

      expect(() => router.scroll(runtime, desc, null)).toThrow(
        'computed is required for scroll'
      )

      expect(scrollSolver.swipeCommit).not.toHaveBeenCalled()
    })

    it('routes default swipeCommit with solver payload', () => {
      const runtime = createRuntimeSwipeCommit()

      const solution = {
        route: 'default',
        payload: {
          isVisible: true,
          delta1D: 100,
          isOverflow: false
        }
      } satisfies {
        route: 'default'
        payload: {
          isVisible: boolean
          delta1D: number
          isOverflow: false
        }
      }

      vi.mocked(scrollSolver.swipeCommit).mockReturnValue(solution)

      expect(router.scroll(runtime, desc, computed)).toEqual({
        action: {
          event: 'swipeCommit',
          payload: solution.payload
        }
      })

      expect(scrollSolver.swipeCommit).toHaveBeenCalledWith(
        runtime,
        desc,
        computed
      )
    })

    it('routes revert to swipeRevert with event override', () => {
      const runtime = createRuntimeSwipeCommit()

      const solution = {
        route: 'revert' as const,
        payload: {
          isVisible: false,
          overflowValue: 0
        }
      }

      vi.mocked(scrollSolver.swipeCommit).mockReturnValue(solution)

      expect(router.scroll(runtime, desc, computed)).toEqual({
        action: {
          event: 'swipeRevert',
          payload: solution.payload
        },
        effects: {
          eventOverride: 'swipeRevert'
        }
      })

      expect(scrollSolver.swipeCommit).toHaveBeenCalledWith(
        runtime,
        desc,
        computed
      )
    })

    it('throws for an unknown solver solution', () => {
      const runtime = createRuntimeSwipeCommit()

      vi.mocked(scrollSolver.swipeCommit).mockReturnValue({
        route: 'banana'
      } as never)

      expect(() => router.scroll(runtime, desc, computed)).toThrow(
        'Unknown scroll solution from swipeCommit'
      )
    })

    it('throws for an unknown event', () => {
      const runtime = {
        ...createRuntimePress(),
        event: 'banana'
      } as never

      expect(() => router.scroll(runtime, desc, computed)).toThrow(
        'Unknown event for scroll solvers: banana'
      )
    })
  })
})