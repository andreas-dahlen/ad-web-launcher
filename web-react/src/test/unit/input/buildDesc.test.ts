import { testBuildDesc } from '@test/testAPI'
import { domQuery } from '@interaction/input/domQuery'
import type { DomMeta } from '@interaction/types/descriptor/base.types'
import { createMetaByType } from '@test/builders/domAndMeta.factory'
import { createMetaContext } from '@test/utils/createTestContext.utils'
import { getStoreByType, seedStoreByType } from '@test/utils/storeSeed.utils'
import type { InteractionType } from '@typing/core.types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { sizeStore } from '../../../shared/state/stores/size.store'
import type { CarouselBinding } from '@primitives/Carousel/store/carousel.store'
import type { SliderBinding } from '@primitives/Slider/store/slider.store'
import type { DragBinding } from '@primitives/Drag/store/drag.store'
import type { ScrollBinding } from '@primitives/Scroll/store/scroll.store'
import { compileDescriptor } from '@interaction/input/buildDesc'
type BuildFn =
  | "buildCarousel"
  | "buildSlider"
  | "buildDrag"
  | "buildScroll"

afterEach(() => {
  vi.restoreAllMocks()
})

function mockFrameRect() {
  vi.spyOn(domQuery, "getElSnapshot").mockReturnValue({ grabOffset: { x: 0, y: 0 }, frame: { top: 0, left: 0 } })
}

describe("[BUILD DESC]", () => {

  describe("[Compile Descriptor]", () => {
    it.each([
      ["drag", "drag"],
      ["slider", "slider"],
      ["carousel", "carousel"],
      ["scroll", "scroll"],
      ["button", "button"],
    ])(
      "%s -> returns correct descriptor type",
      (metaType, expectedType) => {
        mockFrameRect()

        if (metaType !== "button") {
          seedStoreByType(metaType as Exclude<InteractionType, "button">)
        }

        const result = compileDescriptor(
          0,
          0,
          1,
          createMetaByType(metaType as InteractionType)
        )

        expect(result?.type).toBe(expectedType)
      }
    )
  })

  describe("[Main Builders]", () => {
    it.each<[string, Exclude<InteractionType, "button">, BuildFn, unknown, boolean]>([
      ["Carousel Horizontal success", "carousel", "buildCarousel", "horizontal", true],
      ["Carousel Vertical success", "carousel", "buildCarousel", "vertical", true],
      ["Carousel Both fail", "carousel", "buildCarousel", "both", false],

      ["Slider Horizontal success", "slider", "buildSlider", "horizontal", true],
      ["Slider Vertical success", "slider", "buildSlider", "vertical", true],
      ["Slider Both fail", "slider", "buildSlider", "both", false],

      ["Scroll Horizontal success", "scroll", "buildScroll", "horizontal", true],
      ["Scroll Vertical success", "scroll", "buildScroll", "vertical", true],
      ["Scroll Both fail", "scroll", "buildScroll", "both", false],

      ["Drag Horizontal fail", "drag", "buildDrag", "horizontal", false],
      ["Drag Vertical fail", "drag", "buildDrag", "vertical", false],
      ["Drag Both success", "drag", "buildDrag", "both", true],

    ])(

      "%s",
      (_, type, mainFn, axis, expected) => {

        const { meta, builder } = createMetaContext(type)

        mockFrameRect()

        const newMeta = {
          ...meta,
          axis: axis
        } as DomMeta

        const result = testBuildDesc[mainFn](newMeta, builder)

        expect(Boolean(result)).toBe(expected)
      }
    )
  })

  describe("[BuildLayout]", () => {
    it.each([
      ["carousel"],
      ["slider"],
      ["drag"],
      ["scroll"],
    ] as const)(
      "builds %s correctly",
      (type) => {
        vi.spyOn(domQuery, "getElSnapshot").mockReturnValue({ grabOffset: { x: 10, y: 10 }, frame: { top: 50, left: 50 } })

        seedStoreByType(type)
        sizeStore.setState({
          device: { width: 100, height: 100, density: 1 }
        })

        const { meta, builder } = createMetaContext(type)

        const result = testBuildDesc.buildLayout(meta, builder)

        const storeValues = getStoreByType(type)

        expect(result).toEqual(
          expect.objectContaining({
            grabOffset: { x: 10, y: 10 },
            frameRect: { top: 50, left: 50 },
            containerSize: storeValues.layout.containerSize,
            itemSize: storeValues.layout.itemSize,
            deviceSize: { width: 100, height: 100 },
          })
        )
      })
  })

  describe("[buildData]", () => {
    it("returns carousel-specific data", () => {
      const { meta } = createMetaContext("carousel")
      const result = testBuildDesc.buildCarouselData(meta)
      const store = getStoreByType("carousel") as CarouselBinding
      const currentScene = store.nodeBindings.nodes[store.nodeBindings.currentNode].sceneIdx

      const expected = {
        currentScene,
        lockSwipeAt: {
          prev: meta.lockPrevAt,
          next: meta.lockNextAt,
        }
      }
      expect(result).toEqual(expected)
    })


    it("returns slider-specific data", () => {
      const { meta } = createMetaContext("slider")
      const result = testBuildDesc.buildSliderData(meta)
      const store = getStoreByType("slider") as SliderBinding

      const expected = {
        constraints: store.constraints
      }
      expect(result).toEqual(expected)
    })


    it("returns drag-specific data", () => {
      const { meta } = createMetaContext("drag")
      const result = testBuildDesc.buildDragData(meta)
      const store = getStoreByType("drag") as DragBinding

      const expected = {
        settledOffset: store.settledOffset,
        constraints: store.constraints,
        snap: {
          x: meta.snapX,
          y: meta.snapY
        }
      }
      expect(result).toEqual(expected)
    })


    it("returns scroll-specific data", () => {
      const { meta } = createMetaContext("scroll")
      const result = testBuildDesc.buildScrollData(meta)
      const store = getStoreByType("scroll") as ScrollBinding

      const expected = {
        settledValue: store.settledValue,
        isVisible: store.isVisible,
        overflowSide: meta.overflowSide
      }
      expect(result).toEqual(expected)
    })
  })

  describe("[build capabilities]", () => {
    it.each([
      [false, undefined, true, true, false],
      [true, undefined, false, false, true],
      [false, "someAction", false, false, true],
    ])(
      "pressable=%s action=%s => %s",
      (pressable, action, swipeable, instantSwipe, expected) => {

        const meta = {
          pressable,
          swipeable,
          instantSwipe,
          ds: { action }
        } as unknown as DomMeta

        const result = testBuildDesc.buildCapabilities(meta)

        expect(result).toEqual({
          pressable: expected,
          swipeable,
          instantSwipe,
        })
      }
    )
  })
})
