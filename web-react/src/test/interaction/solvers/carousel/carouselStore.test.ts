import { describe, it, expect, beforeEach, vi } from 'vitest'
import { carouselStore, type CarouselBinding } from '@primitives/carousel/store/carousel.store'
import { carousel_DEFAULTS } from '@primitives/carousel/store/useCarouselStore.hook'
function initTest(data: CarouselBinding = carousel_DEFAULTS) {
  carouselStore.getState().init("test", data)
}

function getTest() {
  return carouselStore.getState().bindings["test"]
}


describe("[CAROUSELSTORE]", () => {
  beforeEach(() => {
    carouselStore.setState({
      bindings: {}
    })
    expect(Object.keys(carouselStore.getState().bindings)).toHaveLength(0)
  })

  describe('[Base Functionality]', () => {
    it('adds carousel node', () => {
      initTest()
      expect(getTest()).toEqual({
        ...carousel_DEFAULTS
      })
    })
    it('makes sure no duplicate node', () => {
      initTest()
      initTest()
      const state = carouselStore.getState()
      expect(Object.keys(state.bindings)).toHaveLength(1)
    })
    it('get returns same with as fetching straight up', () => {
      initTest()
      expect(getTest()).toEqual(carouselStore.getState().get("test"))
    })
    it("makes sure that delete deletes", () => {
      initTest()
      carouselStore.getState().init("test2", carousel_DEFAULTS)
      carouselStore.getState().delete("test")
      const state = carouselStore.getState()
      expect(Object.keys(state.bindings)).toHaveLength(1)
      expect(getTest()).toBe(undefined)
      expect(state.bindings["test2"]).toEqual({
        ...carousel_DEFAULTS
      })
    })
  })

  describe("[Domain Specific]", () => {
    it("makes sure that count setter function sets count", () => {
      initTest()
      carouselStore.getState().setCount("test", 5)
      expect(getTest().count).toEqual(5)
    })
    it("makes sure that setLayout setter function sets layout", () => {
      initTest()

      const packet = {
        containerSize: { width: 50, height: 100 },
        itemSize: { width: 100, height: 50 }
      }
      carouselStore.getState().setLayout("test", packet)
      expect(getTest().layout).toEqual(packet)
    })

    it('set Settling resets liveOffset and clears settling on next frame', () => {
      const test: CarouselBinding = { ...carousel_DEFAULTS, settling: true, pendingDir: { dir: "left", axis: "horizontal" }, liveOffset: 100 }

      vi.useFakeTimers()

      try {
        initTest(test)

        carouselStore.getState().setSettling('test')

        expect(getTest().liveOffset).toBe(0)

        vi.advanceTimersByTime(20)
        const state2 = carouselStore.getState()
        expect(state2.bindings["test"].settling).toBe(false)
      } finally {
        vi.useRealTimers()
      }
    })
  })

  describe("[APPLY]", () => {

    it('correctly modifies store at swipeStart', () => {
      const action = { event: "swipeStart" } as const
      const test = { ...carousel_DEFAULTS, settling: true, pendingDir: { dir: "left", axis: "horizontal" }, liveOffset: 100, count: 3 } as const
      const result = { ...carousel_DEFAULTS, settling: false, pendingDir: null, liveOffset: 0, count: 3, dragging: true, index: 1 }

      initTest(test)
      carouselStore.getState().apply("test", action)
      expect(getTest()).toEqual(result)
    })

    it("correctly modifies store at swipe", () => {

      initTest()
      carouselStore.getState().apply("test", {
        event: "swipe",
        payload: { delta1D: 20 }
      })
      expect(getTest().liveOffset).toBe(20)
    })

    it("correctly modifies store at swipeCommit", () => {
      const actionAndResult = {
        event: "swipeCommit",
        payload: {
          delta1D: 20,
          direction: { dir: "up", axis: "vertical" }
        }
      } as const
      const test = { ...carousel_DEFAULTS, settling: false, pendingDir: { dir: "left", axis: "horizontal" }, liveOffset: 100, dragging: true } as const

      initTest(test)
      carouselStore.getState().apply("test", actionAndResult)

      expect(getTest().pendingDir).toEqual(actionAndResult.payload.direction)
      expect(getTest().liveOffset).toEqual(actionAndResult.payload.delta1D)
      expect(getTest().dragging).toBe(false)
    })
    it("correctly modifies store at swipeRevert", () => {
      const action = { event: "swipeRevert" } as const
      const test = { ...carousel_DEFAULTS, pendingDir: { dir: "left", axis: "horizontal" }, liveOffset: 100, dragging: true } as const

      initTest(test)
      carouselStore.getState().apply("test", action)

      expect(getTest().liveOffset).toEqual(0)
      expect(getTest().dragging).toBe(false)
      expect(getTest().pendingDir).toEqual(null)
    })
  })


  //TODO write test(s) for getNextIndex
})