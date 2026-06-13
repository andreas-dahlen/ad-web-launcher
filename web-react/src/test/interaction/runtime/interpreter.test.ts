import { domQuery } from '@interaction/input/domQuery'
import { gestureUtils } from '@interaction/input/gesture.utils'
import { resetGesturesForTests, interpreter, returnGesturesForTests } from '@interaction/input/interpreter'
import { interpreterMap } from '@interaction/runtime/pipeline'
import type { RuntimeStart } from '@interaction/types/runtime.types'
import { createCarouselDesc, createDragDesc } from '@test/builders/desc.factory'
import { createInterpreterPress, createInterpreterSwipeStart } from '@test/builders/input.factory'
import { createRuntimeswipeStart } from '@test/builders/runtime.factory'
import type { EventBridgeType, Vec2 } from '@typing/core.types'
import { afterEach, describe, expect, it, vi } from 'vitest'

const x = 0
const y = 0
const pointerId = 1



afterEach(() => {
  vi.restoreAllMocks()
  resetGesturesForTests()
})

describe("[INTERPRETER]", () => {

  describe("[null Guards]", () => {
    it.each([
      ["down"],
      ["move"],
      ["up"],
    ])(
      "%s -> returned null",
      (eventType) => {

        const spy = eventType === "down"
          ? vi.spyOn(domQuery, 'findTargetInDom')
          : vi.spyOn(domQuery, 'findLaneInDom')

        spy.mockReturnValue(null)
        const interpreterFn = interpreterMap[eventType as EventBridgeType]

        const result = interpreterFn(x, y, pointerId)

        expect(result).toBe(null)
      }
    )
  })

  describe("[On Down]", () => {

    it("ensures a gesture state is initiated", () => {
      vi.spyOn(domQuery, 'findTargetInDom').mockReturnValue(createCarouselDesc())

      const gesturesBefore = returnGesturesForTests()
      expect(gesturesBefore).toStrictEqual({})


      interpreter.onDown(x, y, pointerId)

      const gestures = returnGesturesForTests()
      expect(gestures[pointerId]).toBeDefined()
    })

    it("ensures correct output", () => {
      const mock = createInterpreterPress("carousel")

      vi.spyOn(domQuery, 'findTargetInDom').mockReturnValue(mock.desc)

      const result = interpreter.onDown(x, y, pointerId)

      expect(result).toStrictEqual(mock)
    })
  })

  describe("[On Move]", () => {
    it('remains in PENDING phase while threshold is not exceeded', () => {

      vi.spyOn(domQuery, 'findTargetInDom').mockReturnValue(createCarouselDesc())
      vi.spyOn(gestureUtils, 'swipeThresholdCalc').mockReturnValue(false)
      interpreter.onDown(x, y, pointerId)

      const result = interpreter.onMove(x, y, pointerId)

      expect(result).toBe(null)

      const current = returnGesturesForTests()[pointerId]
      expect(current?.phase).toBe("PENDING")
    })

    it('returns expected package for swipeStart with original descriptor (NO PRESS CANCEL)', () => {
      const expected = createInterpreterSwipeStart("carousel")
      vi.spyOn(domQuery, 'findTargetInDom').mockReturnValue(expected.desc)
      vi.spyOn(gestureUtils, 'swipeThresholdCalc').mockReturnValue(true)
      interpreter.onDown(x, y, pointerId)

      const output = interpreter.onMove(100, y, pointerId)

      expect(output?.runtime.event).toBe("swipeStart")
      expect(output?.runtime).toMatchObject({
        event: expected.runtime.event,
        delta: expected.runtime.delta
      })

      expect(output?.desc).toStrictEqual(expected.desc)
      expect(output?.computed).toStrictEqual(expected.computed)

      const cancelRuntimeTest = output?.runtime as RuntimeStart
      expect(cancelRuntimeTest.cancel).toBeUndefined()
    })
    it('returns expected package for swipeStart with NEW descriptor (no press cancel support)', () => {
      const oldDesc = createCarouselDesc()
      const expected = createInterpreterSwipeStart("drag", { runtime: createRuntimeswipeStart({ delta: { x: x, y: y } }) })
      vi.spyOn(domQuery, 'findTargetInDom').mockReturnValue(oldDesc)
      const swipeSpy = vi
        .spyOn(domQuery, 'findLaneInDom').mockReturnValue(expected.desc)

      const utilsSpy = vi.spyOn(gestureUtils, 'swipeThresholdCalc').mockReturnValue(true)
      const asSwipeableDescSpy = vi.spyOn(gestureUtils, "asSwipeableDescriptor")
      interpreter.onDown(x, y, pointerId)

      const output = interpreter.onMove(x, y, pointerId)

      expect(output?.runtime.event).toBe("swipeStart")
      expect(output?.runtime).toMatchObject({
        event: expected.runtime.event,
        delta: expected.runtime.delta
      })

      expect(swipeSpy).toHaveBeenCalled()
      expect(output?.desc).toStrictEqual(expected.desc)
      expect(output?.computed).toStrictEqual(expected.computed)

      const cancelRuntimeTest = output?.runtime as RuntimeStart
      expect(cancelRuntimeTest.cancel).toBeDefined()
    })
  })

  describe("[Transition]", () => {
    it("swipeStart uses original descriptor and skips lane resolution when threshold exceeded", () => {
      const desc = createCarouselDesc()
      vi.spyOn(domQuery, 'findTargetInDom').mockReturnValue(desc)
      const swipeSpy = vi
        .spyOn(domQuery, 'findLaneInDom')
        .mockImplementation(() => {
          throw new Error("should not be called")
        })

      const utilsSpy = vi.spyOn(gestureUtils, 'swipeThresholdCalc').mockReturnValue(true)
      const asSwipeableDescSpy = vi.spyOn(gestureUtils, "asSwipeableDescriptor")
      interpreter.onDown(x, y, pointerId)

      const output = interpreter.onMove(10, y, pointerId)

      const g = returnGesturesForTests()
      const current = g[pointerId]
      expect(utilsSpy).toHaveBeenCalled()
      expect(asSwipeableDescSpy).toHaveBeenCalled()
      expect(swipeSpy).not.toHaveBeenCalled()
      expect(current?.phase).toBe("SWIPING")
      expect(current?.gesture.desc).toStrictEqual(desc)
      expect(output?.desc).toStrictEqual(desc)
    })

    it("swipeStart replaces descriptor with lane descriptor when threshold exceeded", () => {
      const carouselDesc = createCarouselDesc()
      const dragDesc = createDragDesc()
      vi.spyOn(domQuery, 'findTargetInDom').mockReturnValue(carouselDesc)
      const swipeSpy = vi
        .spyOn(domQuery, 'findLaneInDom').mockReturnValue(dragDesc)

      const utilsSpy = vi.spyOn(gestureUtils, 'swipeThresholdCalc').mockReturnValue(true)
      const asSwipeableDescSpy = vi.spyOn(gestureUtils, "asSwipeableDescriptor")
      interpreter.onDown(x, y, pointerId)

      const output = interpreter.onMove(x, y, pointerId)

      const g = returnGesturesForTests()
      const current = g[pointerId]
      expect(utilsSpy).toHaveBeenCalled()
      expect(asSwipeableDescSpy).toHaveBeenCalled()
      expect(swipeSpy).toHaveBeenCalled()
      expect(current?.phase).toBe("SWIPING")
      expect(current?.gesture.desc).toStrictEqual(dragDesc)
      expect(output?.desc).toStrictEqual(dragDesc)
    })
  })


})