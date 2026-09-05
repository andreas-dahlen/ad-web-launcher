import { describe, it, expect, vi, afterEach } from 'vitest'

import {
  carouselStore,
  type CarouselBinding
} from '@primitives/Carousel/store/carousel.store.ts'

import { applyCommit } from '@test/testApi.ts'

import { carousel_DEFAULTS } from '@primitives/Carousel/store/useCarouselStore.hook.ts'

import {
  getStoreByType,
  seedStoreByType
} from '@test/testUtils/storeSeed.utils.ts'

import { resetInteractionStores } from '@test/testUtils/storeReset.utils.ts'


function initTest(data: CarouselBinding = carousel_DEFAULTS) {
  seedStoreByType("carousel", "test", data)
}


function getTest() {
  return getStoreByType("carousel") as CarouselBinding
}


describe("[CAROUSELSTORE]", () => {
  afterEach(() => {
    resetInteractionStores()
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

      expect(getTest()).toEqual(
        carouselStore.getState().get("test")
      )
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
    it("sets count", () => {
      initTest()

      carouselStore.getState().setCount("test", 5)

      expect(getTest().count).toBe(5)
    })


    it("clamps count to zero", () => {
      initTest()

      carouselStore.getState().setCount("test", -5)

      expect(getTest().count).toBe(0)
    })


    it("sets container size", () => {
      initTest()

      const size = {
        width: 50,
        height: 100
      }

      carouselStore.getState().setContainerSize("test", size)

      expect(getTest().layout.containerSize).toEqual(size)
    })


    it("sets item size", () => {
      initTest()

      const size = {
        width: 100,
        height: 50
      }

      carouselStore.getState().setItemSize("test", size)

      expect(getTest().layout.itemSize).toEqual(size)
    })


    it("gets the current scene", () => {
      const test: CarouselBinding = {
        ...carousel_DEFAULTS,
        nodeBindings: {
          ...carousel_DEFAULTS.nodeBindings,
          currentNode: 1,
          nodes: [
            {
              nodeId: 0,
              sceneIdx: 4
            },
            {
              nodeId: 1,
              sceneIdx: 7
            },
            {
              nodeId: 2,
              sceneIdx: 9
            }
          ]
        }
      }

      initTest(test)

      expect(
        carouselStore.getState().getCurrentScene("test")
      ).toBe(7)
    })


    it('returns undefined for an unknown carousel', () => {
      expect(
        carouselStore.getState().getCurrentScene("missing")
      ).toBeUndefined()
    })


    it('setSettling commits pending direction and clears settling on next frame', () => {
      const test: CarouselBinding = {
        ...carousel_DEFAULTS,
        settling: true,
        pendingDir: {
          dir: "left",
          axis: "horizontal"
        },
        liveOffset: 100
      }

      vi.useFakeTimers()

      try {
        initTest(test)

        carouselStore.getState().setSettling('test')

        expect(getTest().liveOffset).toBe(0)
        expect(getTest().pendingDir).toBeNull()
        expect(getTest().settling).toBe(true)

        vi.runAllTimers()

        expect(getTest().settling).toBe(false)
      } finally {
        vi.useRealTimers()
      }
    })


    it('setSettling does nothing without a pending direction', () => {
      const test: CarouselBinding = {
        ...carousel_DEFAULTS,
        settling: false,
        pendingDir: null,
        liveOffset: 100
      }

      initTest(test)

      carouselStore.getState().setSettling('test')

      expect(getTest()).toEqual(test)
    })
  })


  describe("[APPLY]", () => {
    it('correctly modifies store at swipeStart', () => {
      const action = {
        event: "swipeStart"
      } as const

      const test = {
        ...carousel_DEFAULTS,
        settling: true,
        pendingDir: {
          dir: "left",
          axis: "horizontal"
        },
        liveOffset: 100,
        count: 3
      } as const

      const result = {
        ...carousel_DEFAULTS,
        settling: false,
        pendingDir: null,
        liveOffset: 0,
        count: 3,
        dragging: true
      }

      initTest(test)

      carouselStore.getState().apply("test", action)

      expect(getTest()).toEqual(result)
    })


    it("correctly modifies store at swipe", () => {
      initTest()

      carouselStore.getState().apply("test", {
        event: "swipe",
        payload: {
          delta1D: 20
        }
      })

      expect(getTest().liveOffset).toBe(20)
    })


    it("correctly modifies store at swipeCommit", () => {
      const actionAndResult = {
        event: "swipeCommit",
        payload: {
          delta1D: 20,
          direction: {
            dir: "up",
            axis: "vertical"
          }
        }
      } as const

      const test = {
        ...carousel_DEFAULTS,
        settling: false,
        pendingDir: {
          dir: "left",
          axis: "horizontal"
        },
        liveOffset: 100,
        dragging: true
      } as const

      initTest(test)

      carouselStore.getState().apply("test", actionAndResult)

      expect(getTest().pendingDir).toEqual(
        actionAndResult.payload.direction
      )

      expect(getTest().liveOffset).toEqual(
        actionAndResult.payload.delta1D
      )

      expect(getTest().dragging).toBe(false)
    })


    it("ignores swipeCommit while settling", () => {
      const action = {
        event: "swipeCommit",
        payload: {
          delta1D: 20,
          direction: {
            dir: "left",
            axis: "horizontal"
          }
        }
      } as const

      const test = {
        ...carousel_DEFAULTS,
        settling: true,
        pendingDir: null,
        liveOffset: 100,
        dragging: true
      } as const

      initTest(test)

      carouselStore.getState().apply("test", action)

      expect(getTest()).toEqual(test)
    })


    it("correctly modifies store at swipeRevert", () => {
      const action = {
        event: "swipeRevert"
      } as const

      const test = {
        ...carousel_DEFAULTS,
        pendingDir: {
          dir: "left",
          axis: "horizontal"
        },
        liveOffset: 100,
        dragging: true
      } as const

      initTest(test)

      carouselStore.getState().apply("test", action)

      expect(getTest().liveOffset).toEqual(0)
      expect(getTest().dragging).toBe(false)
      expect(getTest().pendingDir).toEqual(null)
    })
  })


  describe("[applyCommit]", () => {
    it("commits to the next node", () => {
      const binding: CarouselBinding = {
        ...carousel_DEFAULTS,
        count: 5,
        pendingDir: {
          dir: "left",
          axis: "horizontal"
        },
        nodeBindings: {
          currentNode: 1,
          nodes: [
            { nodeId: 0, sceneIdx: 0 },
            { nodeId: 1, sceneIdx: 1 },
            { nodeId: 2, sceneIdx: 2 }
          ]
        }
      }

      applyCommit(binding)

      expect(binding.nodeBindings.currentNode).toBe(2)

      expect(binding.nodeBindings.nodes).toEqual([
        { nodeId: 0, sceneIdx: 3 },
        { nodeId: 1, sceneIdx: 1 },
        { nodeId: 2, sceneIdx: 2 }
      ])
    })


    it("commits to the previous node", () => {
      const binding: CarouselBinding = {
        ...carousel_DEFAULTS,
        count: 5,
        pendingDir: {
          dir: "right",
          axis: "horizontal"
        },
        nodeBindings: {
          currentNode: 1,
          nodes: [
            { nodeId: 0, sceneIdx: 0 },
            { nodeId: 1, sceneIdx: 1 },
            { nodeId: 2, sceneIdx: 2 }
          ]
        }
      }

      applyCommit(binding)

      expect(binding.nodeBindings.currentNode).toBe(0)

      expect(binding.nodeBindings.nodes).toEqual([
        { nodeId: 0, sceneIdx: 0 },
        { nodeId: 1, sceneIdx: 1 },
        { nodeId: 2, sceneIdx: 4 }
      ])
    })


    it("does nothing without a pending direction", () => {
      const binding: CarouselBinding = {
        ...carousel_DEFAULTS,
        pendingDir: null
      }

      const before = structuredClone(binding)

      applyCommit(binding)

      expect(binding).toEqual(before)
    })
  })
})