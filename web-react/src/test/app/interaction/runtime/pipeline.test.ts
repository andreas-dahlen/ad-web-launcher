import type { PointerEventPackage } from '@interaction/adapter/usePointerBridge.hook.ts'
import { interpreter } from '@interaction/input/interpreter.ts'
import { pipeline } from '@interaction/runtime/pipeline.ts'
import { router } from '@interaction/runtime/solverRouter.ts'
import type { InterpreterOutput } from '@interaction/types/runtime/interpreter.types.ts'
import { testPipeline } from '@test/testApi.ts'
import { domUpdater } from '@interaction/updater/domUpdater.ts'
import { createBaseInteraction } from '@test/app/interaction/builders/base.factory.ts'
import { createComputedScroll, createComputedSlider } from '@test/app/interaction/builders/computed.factory.ts'
import { createCarouselData } from '@test/app/interaction/builders/data.factory.ts'
import { createInterpreterPress, createInterpreterPressRelease, createInterpreterSwipe, createInterpreterSwipeCommit, createInterpreterSwipeStart } from '@test/app/interaction/builders/input.factory.ts'
import { createRuntimeSwipe } from '@test/app/interaction/builders/runtime.factory.ts'
import { capabilities_DEFAULT } from '@test/app/interaction/fixtures/capabilities.fixture.ts'
import type { EventBridgeType } from '@shared/types/core.types.ts'
import { afterEach, describe, expect, it, vi } from 'vitest'

const pipeline_DEFAULT = {
  eventType: "down",
  x: 0,
  y: 0,
  pointerId: 1
} as const

afterEach(() => {
  vi.restoreAllMocks()
})

describe("[PIPELINE]", () => {

  describe("[Interpreter Calls]", () => {
    it('routes events to the correct function', () => {
      const downSpy = vi.spyOn(testPipeline.interpreterMap, 'down').mockReturnValue(null)
      const moveSpy = vi.spyOn(testPipeline.interpreterMap, 'move').mockReturnValue(null)
      const upSpy = vi.spyOn(testPipeline.interpreterMap, 'up').mockReturnValue(null)


      pipeline.orchestrate(pipeline_DEFAULT)
      pipeline.orchestrate(
        { eventType: "move", x: 5, y: 10, pointerId: 2 }
      )
      pipeline.orchestrate(
        { eventType: "up", x: 15, y: 25, pointerId: 3 }
      )
      expect(downSpy).toHaveBeenCalledWith(0, 0, 1)
      expect(moveSpy).toHaveBeenCalledWith(5, 10, 2)
      expect(upSpy).toHaveBeenCalledWith(15, 25, 3)
      expect(downSpy).toHaveBeenCalledTimes(1)
      expect(moveSpy).toHaveBeenCalledTimes(1)
      expect(upSpy).toHaveBeenCalledTimes(1)
    })
  })

  it("throws when the function doesn't exist", () => {
    expect(() =>
      pipeline.orchestrate({
        ...pipeline_DEFAULT,
        eventType: 'banana' as EventBridgeType,
      })
    ).toThrow('Unknown eventType')
  })

  it("returns null when the function returns nothing", () => {
    vi.spyOn(testPipeline.interpreterMap, 'down').mockReturnValue(null)

    const domSpy = vi.spyOn(domUpdater, 'handle')

    const result = pipeline.orchestrate(pipeline_DEFAULT)

    expect(result).toBeNull()
    expect(domSpy).not.toHaveBeenCalled()
  })
  describe("[Base Router Calls]", () => {
    it("throws an error when type is wrong", () => {
      const mock = {
        runtime: createRuntimeSwipe(),
        desc: {
          type: "banana",
          base: createBaseInteraction(),
          data: createCarouselData(),
          capabilities: capabilities_DEFAULT
        },
        computed: null
      } as unknown as InterpreterOutput
      const domSpy = vi.spyOn(domUpdater, 'handle')
      const spy = vi.spyOn(testPipeline.interpreterMap, 'down').mockReturnValue(mock)

      expect(() =>
        pipeline.orchestrate(pipeline_DEFAULT)
      ).toThrow("Unknown descriptor type")
      expect(spy).toHaveBeenCalledTimes(1)
      expect(domSpy).not.toHaveBeenCalled()
    })


    it.each([
      ["drag", createInterpreterSwipeStart("drag")],
      ["slider", createInterpreterSwipeStart("slider")],
      ["carousel", createInterpreterSwipeStart("carousel")],
      ["scroll", createInterpreterSwipeStart("scroll")]
    ])(
      "%s -> routes correctly",
      (eventType, mock) => {

        vi.spyOn(testPipeline.interpreterMap, "move").mockReturnValue(mock)
        const routerSpy = vi.spyOn(router, eventType as "drag" | "slider" | "carousel" | "scroll")

        pipeline.orchestrate({
          eventType: "move",
          x: 0,
          y: 0,
          pointerId: 1
        } as PointerEventPackage)

        expect(routerSpy).toHaveBeenCalled()
        expect(routerSpy).toHaveBeenCalledTimes(1)
      }
    )

    it.each([
      ["scroll", createInterpreterSwipe("scroll",
        { computed: createComputedScroll() })],

      ["slider", createInterpreterSwipe("slider",
        { computed: createComputedSlider() })],
    ])(
      "%s -> correctly needs computedUpdate",
      (eventType, mock) => {

        vi.spyOn(testPipeline.interpreterMap, "move").mockReturnValue(mock)
        const routerSpy = vi.spyOn(router, eventType as "slider" | "scroll")

        pipeline.orchestrate({
          eventType: "move",
          x: 0,
          y: 0,
          pointerId: 1
        } as PointerEventPackage)

        expect(routerSpy).toHaveBeenCalled()
        expect(routerSpy).toHaveBeenCalledTimes(1)
        expect(routerSpy).toHaveBeenCalledWith(mock.runtime, mock.desc, mock.computed)
      }
    )
  })

  describe("[Router null returns]", () => {
    it.each([
      ["carousel", "carousel"],
      ["slider", "slider"],
      ["drag", "drag"],
      ["scroll", "scroll"],
    ])(
      " %s route returned null correctly on pressRelease",
      (descType, expectedRouter) => {
        const mock = createInterpreterPressRelease(descType as "carousel" | "slider" | "drag" | "scroll")

        vi.spyOn(testPipeline.interpreterMap, "up").mockReturnValue(mock)
        const routerSpy = vi.spyOn(router, expectedRouter as "carousel" | "slider" | "drag" | "scroll")

        pipeline.orchestrate({
          eventType: "up",
          x: 10,
          y: 20,
          pointerId: 1
        })

        expect(routerSpy).toHaveReturnedWith(null)
      }
    )
  })


  describe("[After Router Effects]", () => {
    it("slider swipeStart returns computed update", () => {
      const mock = createInterpreterSwipeStart("slider")

      vi.spyOn(testPipeline.interpreterMap, "move").mockReturnValue(mock)
      const spy = vi.spyOn(interpreter, "applyComputedUpdate")

      pipeline.orchestrate({
        eventType: "move",
        x: 0,
        y: 0,
        pointerId: 1
      })

      expect(spy).toHaveBeenCalled()
    })
    it("scroll swipeStart returns computed update", () => {
      const mock = createInterpreterSwipeStart("scroll")

      vi.spyOn(testPipeline.interpreterMap, "move").mockReturnValue(mock)
      const spy = vi.spyOn(interpreter, "applyComputedUpdate")

      pipeline.orchestrate({
        eventType: "move",
        x: 0,
        y: 0,
        pointerId: 1
      })

      expect(spy).toHaveBeenCalled()
    })
  })


  describe("[Final effects]", () => {
    it.each([
      ["scroll press", "down", createInterpreterPress("scroll")],
      ["slider swipeStart", "move", createInterpreterSwipeStart("slider")],
      ["carousel swipe", "up", createInterpreterSwipe("carousel")],
      ["carousel revert", "move", createInterpreterSwipeCommit("carousel", {
        runtime: {
          delta: { x: 0, y: 0 }, event: "swipeCommit"
        }
      })],
      ["drag commit", "up", createInterpreterSwipeCommit("drag")],
      ["button release", "up", createInterpreterPressRelease("button")]
    ])(
      "%s -> routes to domUpdater",
      (_, eventType, mock) => {

        vi.spyOn(testPipeline.interpreterMap, eventType as "up" | "down" | "move").mockReturnValue(mock)
        const domSpy = vi.spyOn(domUpdater, "handle")

        pipeline.orchestrate({
          eventType,
          x: 0,
          y: 0,
          pointerId: 1
        } as PointerEventPackage)

        if (eventType === 'move' && mock.desc.type === "carousel") {
          const [[runtimeArg]] = domSpy.mock.calls
          expect(runtimeArg).toMatchObject({
            event: "swipeRevert"
          })
        }

        expect(domSpy).toHaveBeenCalled()
      }
    )
  })
})

