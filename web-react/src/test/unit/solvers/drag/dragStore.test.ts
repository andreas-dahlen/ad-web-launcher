import { describe, it, expect, afterEach } from 'vitest'
import { dragStore, type DragBinding } from '@primitives/DragPrim/store/drag.store'
import { drag_DEFAULTS } from '@primitives/DragPrim/store/useDragStore.hook'
import { getStoreByType, seedStoreByType } from '@test/utils/storeSeed.utils'
import { resetInteractionStores } from '@test/utils/storeReset.utils'

function initTest(data: DragBinding = drag_DEFAULTS) {
  seedStoreByType("drag", "test", data)
}

function getTest() {
  return getStoreByType("drag") as DragBinding
}


describe("[DRAGSTORE]", () => {
  afterEach(() => { resetInteractionStores() })


  describe('[Base Functionality]', () => {
    it('adds drag node', () => {
      initTest()
      expect(getTest()).toEqual({
        ...drag_DEFAULTS
      })
    })
    it('makes sure no duplicate node', () => {
      initTest()
      initTest()
      const state = dragStore.getState()
      expect(Object.keys(state.bindings)).toHaveLength(1)
    })
    it('get returns same with as fetching straight up', () => {
      initTest()
      expect(getTest()).toEqual(dragStore.getState().get("test"))
    })
    it("makes sure that delete deletes", () => {
      initTest()
      dragStore.getState().init("test2", drag_DEFAULTS)
      dragStore.getState().delete("test")
      const state = dragStore.getState()
      expect(Object.keys(state.bindings)).toHaveLength(1)
      expect(getTest()).toBe(undefined)
      expect(state.bindings["test2"]).toEqual({
        ...drag_DEFAULTS
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
      dragStore.getState().setLayout("test", packet)
      expect(getTest().layout).toEqual(packet)
    })

    it("makes sure that constaints setter function sets constraints", () => {
      const constraints = { minX: 100, maxX: 1000, minY: 50, maxY: 150 }
      initTest()
      dragStore.getState().setConstraints("test", constraints)
      expect(getTest().constraints).toEqual(constraints)
    })
    it("makes sure that frameRect setter function sets frameRect", () => {
      const frameRect = { left: 24, top: 34, width: 53, height: 23 }
      initTest()
      dragStore.getState().setFrameRect("test", frameRect)
      expect(getTest().frameRect).toEqual(frameRect)
    })

    it("makes sure that setPosition setter function sets settledOffset", () => {
      const position = { x: 24, y: 34 }
      initTest()
      dragStore.getState().setPosition("test", position)
      expect(getTest().settledOffset).toEqual(position)
    })
  })


  describe("[APPLY]", () => {

    it('correctly modifies store at swipeStart', () => {
      const action = { event: "swipeStart", payload: { frameRect: { left: 0, top: 34, width: 53, height: 23 } } } as const
      const test = { ...drag_DEFAULTS, dragging: false, liveOffset: { x: 32, y: 40 } }

      initTest(test)
      dragStore.getState().apply("test", action)
      expect(getTest().frameRect).toEqual(action.payload.frameRect)
      expect(getTest().dragging).toBe(true)
      expect(getTest().liveOffset).toEqual({ x: 0, y: 0 })
    })

    it("correctly modifies store at swipe", () => {

      initTest()
      dragStore.getState().apply("test", {
        event: "swipe",
        payload: { delta: { x: 20, y: 30 } }
      })
      expect(getTest().liveOffset).toEqual({ x: 20, y: 30 })
    })

    it("correctly modifies store at swipeCommit", () => {
      const test = { ...drag_DEFAULTS, dragging: true, liveOffset: { x: 32, y: 40 } }
      initTest(test)
      dragStore.getState().apply("test", {
        event: "swipeCommit",
        payload: { delta: { x: 20, y: 30 } }
      })
      expect(getTest().settledOffset).toEqual({ x: 20, y: 30 })
      expect(getTest().liveOffset).toEqual({ x: 0, y: 0 })
      expect(getTest().dragging).toBe(false)
    })
  })
})