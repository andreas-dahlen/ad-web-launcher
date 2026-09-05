import { describe, it, expect, afterEach } from 'vitest'
import { sliderStore, type SliderBinding } from '@primitives/Slider/store/slider.store.ts'
import { slider_DEFAULTS } from '@primitives/Slider/store/useSliderStore.hook.ts'
import { getStoreByType, seedStoreByType } from '@test/testUtils/storeSeed.utils.ts'
import { resetInteractionStores } from '@test/testUtils/storeReset.utils.ts'
function initTest(data: SliderBinding = slider_DEFAULTS) {
  seedStoreByType("slider", "test", data)
}

function getTest() {
  return getStoreByType("slider") as SliderBinding
}


describe("[SLIDERSTORE]", () => {
  afterEach(() => { resetInteractionStores() })


  describe('[Base Functionality]', () => {
    it('adds slider node', () => {
      initTest()
      expect(getTest()).toEqual({
        ...slider_DEFAULTS
      })
    })
    it('makes sure no duplicate node', () => {
      initTest()
      initTest()
      const state = sliderStore.getState()
      expect(Object.keys(state.bindings)).toHaveLength(1)
    })
    it('get returns same with as fetching straight up', () => {
      initTest()
      expect(getTest()).toEqual(sliderStore.getState().get("test"))
    })
    it("makes sure that delete deletes", () => {
      initTest()
      sliderStore.getState().init("test2", slider_DEFAULTS)
      sliderStore.getState().delete("test")
      const state = sliderStore.getState()
      expect(Object.keys(state.bindings)).toHaveLength(1)
      expect(getTest()).toBe(undefined)
      expect(state.bindings["test2"]).toEqual({
        ...slider_DEFAULTS
      })
    })

  })

  describe("[Domain Specific]", () => {
    it("makes sure that constaints setter function sets constraints", () => {
      initTest()
      sliderStore.getState().setConstraints("test", { min: 100, max: 1000 })
      expect(getTest().constraints).toEqual({ min: 100, max: 1000 })
    })
    it("makes sure that setLayout setter function sets layout", () => {
      initTest()

      const packet = {
        containerSize: { width: 50, height: 100 },
        itemSize: { width: 100, height: 50 }
      }
      sliderStore.getState().setLayout("test", packet)
      expect(getTest().layout).toEqual(packet)
    })
  })


  describe("[APPLY]", () => {

    it('correctly modifies store at press', () => {

      initTest()
      sliderStore.getState().apply("test", {
        event: "press",
        payload: { delta1D: 5 }
      })
      expect(getTest().value).toEqual(5)
    })

    it('correctly modifies store at swipeStart', () => {
      const action = { event: "swipeStart", payload: { delta1D: 5, computedUpdate: { pointerId: 1, sliderStartOffset: 5, sliderValuePerPixel: 6 } } } as const

      initTest()
      sliderStore.getState().apply("test", action)
      expect(getTest().value).toEqual(action.payload.delta1D)
    })

    it("correctly modifies store at swipe", () => {
      initTest()
      sliderStore.getState().apply("test", {
        event: "swipe",
        payload: { delta1D: 5 }
      })
      expect(getTest().value).toEqual(5)
    })

    it("correctly modifies store at swipeCommit", () => {
      initTest()
      sliderStore.getState().apply("test", {
        event: "swipeCommit",
        payload: { delta1D: 53 }
      })
      expect(getTest().value).toEqual(53)
    })
  })
})