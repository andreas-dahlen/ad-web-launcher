import { buildDesc } from '@interaction/input/buildDesc'
import { domQuery } from '@interaction/input/domQuery'
import type { BaseWithSwipe, DomMeta } from '@interaction/types/base.types'
import type { Descriptor } from '@interaction/types/descriptor.types'
import { createInteractionElement } from '@test/builders/domAndMeta.factory'
import { createMetaContext } from '@test/utils/createTestContext.utils'
import { getStoreByType, seedStoreByType } from '@test/utils/storeSeed.utils'
import type { InteractionType } from '@typing/core.types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { sizeStore } from '../../../shared/stores/size.store'
type BuildFn =
  | "buildCarousel"
  | "buildSlider"
  | "buildDrag"
  | "buildScroll"

type BuildDataFn =
  | "buildCarouselData"
  | "buildSliderData"
  | "buildDragData"
  | "buildScrollData"

afterEach(() => {
  vi.restoreAllMocks()
})

describe("[BUILD DESC]", () => {

  describe("Resolve From Element", () => {
    it.each([
      ["drag", "buildDrag"],
      ["slider", "buildSlider"],
      ["carousel", "buildCarousel"],
      ["scroll", "buildScroll"],
      ["button", "buildButton"]
    ])(
      "%s -> routes correctly",
      (eventType, route) => {

        const spy = vi.spyOn(buildDesc, route as "buildDrag" | "buildSlider" | "buildCarousel" | "buildScroll" | "buildButton").mockReturnValue({} as Descriptor)

        const el = createInteractionElement(eventType as InteractionType)

        buildDesc.resolveFromElement(el, 0, 0, 0)

        expect(spy).toHaveBeenCalledTimes(1)
      }
    )
  })

  describe("[Main Builders]", () => {
    it.each<[string, Exclude<InteractionType, "button">, BuildFn, BuildDataFn, unknown, boolean]>([
      ["Carousel Horizontal success", "carousel", "buildCarousel", "buildCarouselData", "horizontal", true],
      ["Carousel Vertical success", "carousel", "buildCarousel", "buildCarouselData", "vertical", true],
      ["Carousel Both fail", "carousel", "buildCarousel", "buildCarouselData", "both", false],

      ["Slider Horizontal success", "slider", "buildSlider", "buildSliderData", "horizontal", true],
      ["Slider Vertical success", "slider", "buildSlider", "buildSliderData", "vertical", true],
      ["Slider Both fail", "slider", "buildSlider", "buildSliderData", "both", false],

      ["Scroll Horizontal success", "scroll", "buildScroll", "buildScrollData", "horizontal", true],
      ["Scroll Vertical success", "scroll", "buildScroll", "buildScrollData", "vertical", true],
      ["Scroll Both fail", "scroll", "buildScroll", "buildScrollData", "both", false],

      ["Drag Horizontal fail", "drag", "buildDrag", "buildDragData", "horizontal", false],
      ["Drag Vertical fail", "drag", "buildDrag", "buildDragData", "vertical", false],
      ["Drag Both success", "drag", "buildDrag", "buildDragData", "both", true],

    ])(

      "%s",
      (_, type, mainFn, dataFn, axis, expected) => {

        const { meta, builder } = createMetaContext(type)

        const spy = vi.spyOn(buildDesc, dataFn)
        vi.spyOn(buildDesc, "buildSwipeBase").mockReturnValue(null as unknown as BaseWithSwipe)

        const newMeta = {
          ...meta,
          axis: axis
        } as DomMeta

        const result = buildDesc[mainFn](newMeta, builder)

        if (expected) {
          expect(spy).toHaveBeenCalled()
          expect(result).toBeTruthy()
        } else {
          expect(result).toBe(null)
          expect(spy).not.toHaveBeenCalled()
        }
      }
    )
  })

  describe("buildLayout", () => {
    describe("buildLayout", () => {
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

          const result = buildDesc.buildLayout(meta, builder)

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
  })
})
