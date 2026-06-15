import { describe, it, expect, afterEach } from 'vitest'
import { scrollStore, type ScrollBinding } from '@primitives/scroll/store/scroll.store'
import { scroll_DEFAULTS } from '@primitives/scroll/store/useScrollStore.hook'
import { getStoreByType, seedStoreByType } from '@test/utils/storeSeed.utils'
import { resetInteractionStores } from '@test/utils/storeReset.utils'
function initTest(data: ScrollBinding = scroll_DEFAULTS) {
  seedStoreByType("scroll", "test", data)
}

function getTest() {
  return getStoreByType("scroll") as ScrollBinding
}


describe("[SCROLLSTORE]", () => {
  afterEach(() => { resetInteractionStores() })


  describe('[Base Functionality]', () => {
    it('adds scroll node', () => {
      initTest()
      expect(getTest()).toEqual({
        ...scroll_DEFAULTS
      })
    })
    it('makes sure no duplicate node', () => {
      initTest()
      initTest()
      const state = scrollStore.getState()
      expect(Object.keys(state.bindings)).toHaveLength(1)
    })
    it('get returns same with as fetching straight up', () => {
      initTest()
      expect(getTest()).toEqual(scrollStore.getState().get("test"))
    })
    it("makes sure that delete deletes", () => {
      initTest()
      scrollStore.getState().init("test2", scroll_DEFAULTS)
      scrollStore.getState().delete("test")
      const state = scrollStore.getState()
      expect(Object.keys(state.bindings)).toHaveLength(1)
      expect(getTest()).toBe(undefined)
      expect(state.bindings["test2"]).toEqual({
        ...scroll_DEFAULTS
      })
    })
  })


  describe("[Domain Specific]", () => {

    it("makes sure that setLayout setter function sets layout", () => {
      initTest()

      const packet = {
        containerSize: { width: 50, height: 100 },
        itemSize: { width: 100, height: 50 }
      }
      scrollStore.getState().setLayout("test", packet)
      expect(getTest().layout).toEqual(packet)
    })
  })


  describe("[APPLY]", () => {

    describe("[NORMAL]", () => {

      describe("[SwipeStart]", () => {
        it('correctly modifies store at swipeStart', () => {
          const action = { event: "swipeStart", payload: { delta1D: 20, isOverflow: false } } as const
          const test = { ...scroll_DEFAULTS, dragging: false, liveValue: 30, overflowValue: 0 }

          initTest(test)
          scrollStore.getState().apply("test", action)
          expect(getTest()).toEqual({ ...scroll_DEFAULTS, dragging: true, liveValue: 20, overflowValue: 0 })
        })
      })
      describe("[Swipe]", () => {
        it('correctly modifies store at swipe', () => {
          const action = { event: "swipe", payload: { delta1D: 20, isOverflow: false } } as const
          const test = { ...scroll_DEFAULTS, liveValue: 30, overflowValue: 0 }

          const velocity = action.payload.delta1D - test.liveValue

          initTest(test)
          scrollStore.getState().apply("test", action)
          expect(getTest()).toEqual({ ...scroll_DEFAULTS, liveValue: 20, velocity: velocity, overflowValue: 0 })
        })
      })
      describe("[SwipeCommit]", () => {
        it('correctly modifies store at swipeCommit', () => {
          const action = { event: "swipeCommit", payload: { delta1D: 20, isOverflow: false, isVisible: true } } as const
          const test = { ...scroll_DEFAULTS, liveValue: 30, isVisible: false, dragging: true, overflowValue: 0 }

          initTest(test)
          scrollStore.getState().apply("test", action)
          expect(getTest()).toEqual({ ...scroll_DEFAULTS, liveValue: 20, settledValue: 20, velocity: 0, dragging: false, isVisible: true, overflowValue: 0 })
        })
      })



    })
    describe("[OVERFLOW]", () => {
      describe("[SwipeStart]", () => {
        it('correctly modifies store at swipeStart', () => {
          const action = { event: "swipeStart", payload: { isOverflow: true } } as const
          const test = { ...scroll_DEFAULTS, dragging: false, liveValue: 0 }

          initTest(test)
          scrollStore.getState().apply("test", action)
          expect(getTest()).toEqual({ ...scroll_DEFAULTS, dragging: true, liveValue: 0 })
        })
      })

      describe("[Swipe]", () => {
        it('correctly modifies store at swipe', () => {
          const action = { event: "swipe", payload: { overflowValue: 20, isOverflow: true } } as const
          const test = { ...scroll_DEFAULTS, overflowValue: 30, liveValue: 0 }

          initTest(test)
          scrollStore.getState().apply("test", action)
          expect(getTest()).toEqual({ ...scroll_DEFAULTS, overflowValue: 20, liveValue: 0 })
        })
      })

      describe("[SwipeCommit]", () => {
        it('sets visible to [TRUE]', () => {
          const actionTrue = { event: "swipeCommit", payload: { isVisible: true, overflowValue: 20, isOverflow: true } } as const

          const testTrue = { ...scroll_DEFAULTS, overflowValue: 30, liveValue: 0, dragging: true, isVisible: false }

          initTest(testTrue)
          scrollStore.getState().apply("test", actionTrue)
          expect(getTest()).toEqual({ ...scroll_DEFAULTS, overflowValue: 20, liveValue: 0, isVisible: true })
        })
        it('sets visible to [FALSE]', () => {
          const actionFalse = { event: "swipeCommit", payload: { isVisible: false, overflowValue: 10, isOverflow: true } } as const
          const testFalse = { ...scroll_DEFAULTS, overflowValue: 30, liveValue: 0, dragging: true, isVisible: true }

          initTest(testFalse)
          scrollStore.getState().apply("test", actionFalse)
          expect(getTest()).toEqual({ ...scroll_DEFAULTS, overflowValue: 10, liveValue: 0, isVisible: false })
        })
      })

      describe("[SwipeRevert]", () => {
        it('sets visible to [TRUE]', () => {
          const actionTrue = { event: "swipeRevert", payload: { isVisible: true, overflowValue: 20 } } as const

          const testTrue = { ...scroll_DEFAULTS, overflowValue: 30, liveValue: 50, dragging: true, settledValue: 30 }

          initTest(testTrue)
          scrollStore.getState().apply("test", actionTrue)
          expect(getTest()).toEqual({ ...scroll_DEFAULTS, overflowValue: 20, liveValue: 0, isVisible: true, settledValue: 0 })

        })
        it(' sets visible to [FALSE]', () => {
          const actionFalse = { event: "swipeRevert", payload: { isVisible: false, overflowValue: 10 } } as const

          const testFalse = { ...scroll_DEFAULTS, overflowValue: 30, liveValue: 47, dragging: true, settledValue: 50 }

          initTest(testFalse)
          scrollStore.getState().apply("test", actionFalse)
          expect(getTest()).toEqual({ ...scroll_DEFAULTS, overflowValue: 10, liveValue: 0, isVisible: false, settledValue: 0 })
        })
      })
    })
  })
})